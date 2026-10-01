import { Router } from "express";
import { usuariosRepository } from "../repositories";

const router = Router();

// GET /api/usuarios
router.get("/usuarios", async (req, res) => {
  try {
    const users = await usuariosRepository.getAll();
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email requerido." });
    }

    const existingUser = await usuariosRepository.getByEmail(email);
    const user = existingUser || {
      id: "usr-" + Date.now(),
      nombre: email.split("@")[0],
      apellido: "CeCIP",
      email,
      rol: "Administrador General" as const,
      estado: "Activo" as const,
    };

    return res.json({
      user,
      token: "cecip_jwt_token_" + Buffer.from(JSON.stringify(user)).toString("base64"),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/session
router.get("/auth/session", async (req, res) => {
  try {
    const users = await usuariosRepository.getAll();
    return res.json(users[0] || null);
  } catch (error: any) {
    return res.json(null);
  }
});

export default router;
