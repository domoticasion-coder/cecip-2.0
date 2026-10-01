import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

import authRouter from "./server/routes/auth";
import sociosRouter from "./server/routes/socios";
import facturasRouter from "./server/routes/facturas";
import tesoreriaRouter from "./server/routes/tesoreria";
import crmRouter from "./server/routes/crm";
import eventosRouter from "./server/routes/eventos";
import ticketsRouter from "./server/routes/tickets";
import bolsaRouter from "./server/routes/bolsa";
import conveniosRouter from "./server/routes/convenios";
import documentosRouter from "./server/routes/documentos";
import noticiasRouter from "./server/routes/noticias";
import contactoRouter from "./server/routes/contacto";
import dashboardRouter from "./server/routes/dashboard";
import storageRouter from "./server/routes/storage";
import copilotRouter from "./server/routes/copilot";
import intelligenceRouter from "./server/routes/intelligence";
import { operationalScheduler } from "./server/scheduler";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Static uploads folder
  const uploadsPath = path.join(process.cwd(), "public", "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    });
  });

  // Mount API Routers
  app.use("/api", authRouter);
  app.use("/api", sociosRouter);
  app.use("/api", facturasRouter);
  app.use("/api", tesoreriaRouter);
  app.use("/api", crmRouter);
  app.use("/api", eventosRouter);
  app.use("/api", ticketsRouter);
  app.use("/api", bolsaRouter);
  app.use("/api", conveniosRouter);
  app.use("/api", documentosRouter);
  app.use("/api", noticiasRouter);
  app.use("/api", contactoRouter);
  app.use("/api", dashboardRouter);
  app.use("/api", storageRouter);
  app.use("/api", copilotRouter);
  app.use("/api", intelligenceRouter);

  // Iniciar Scheduler de Tareas Periódicas de Inteligencia
  operationalScheduler.start(15);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CeCIP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
