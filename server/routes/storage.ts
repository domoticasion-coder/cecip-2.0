import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { supabase } from "../db";

const router = Router();

// Ensure local uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// POST /api/storage/upload
router.post("/storage/upload", upload.single("file"), async (req, res) => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No se adjuntó ningún archivo." });
    }

    const { originalname, size, filename } = file;
    const folder = (req.query.folder as string) || "general";
    const fileSizeFormatted = `${(size / (1024 * 1024)).toFixed(1)} MB`;
    let publicUrl = `/uploads/${filename}`;

    // If Supabase Storage is configured, try uploading to the bucket
    if (supabase) {
      try {
        const fileBuffer = fs.readFileSync(file.path);
        const bucketName = folder === "cvs" ? "cvs" : "documentos";
        const uploadPath = `${Date.now()}-${originalname}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(uploadPath, fileBuffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uploadPath);
          if (publicUrlData && publicUrlData.publicUrl) {
            publicUrl = publicUrlData.publicUrl;
          }
        }
      } catch (e: any) {
        console.warn("No se pudo subir a Supabase Storage bucket, usando almacenamiento local:", e.message);
      }
    }

    return res.json({
      fileName: originalname,
      fileSize: fileSizeFormatted,
      filePath: publicUrl,
      url: publicUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
