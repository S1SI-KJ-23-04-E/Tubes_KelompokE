import express from "express";
import { selesaiLaporan, tolakLaporan } from "../controllers/laporanController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Selesaikan laporan
router.patch("/:id/selesai", authMiddleware, selesaiLaporan);

// Tolak laporan
router.patch("/:id/tolak", authMiddleware, tolakLaporan);

export default router;
