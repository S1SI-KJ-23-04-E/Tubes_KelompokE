import express from "express";
import { selesaiLaporan, tolakLaporan } from "../controllers/laporanController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js"; // ✅ TAMBAHAN

const router = express.Router();

// ✅ UPDATE DI SINI
router.patch(
  "/:id/selesai",
  authMiddleware,
  roleMiddleware("kecamatan"),
  selesaiLaporan
);

router.patch(
  "/:id/tolak",
  authMiddleware,
  roleMiddleware("kecamatan"),
  tolakLaporan
);

export default router;