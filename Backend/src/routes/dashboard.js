import express from "express";
import {
  getPerformanceDashboardService,
} from "../service/dashboardService.js";

import {
  authenticate,
} from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/performance",
  authenticate,
  async (req, res) => {
    try {

      // hanya super admin
      if (
        req.user.profile.role !==
        "super_admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Akses ditolak. Hanya Super Admin yang dapat mengakses dashboard."
        });
      }

      const data =
        await getPerformanceDashboardService();

      return res.status(200).json({
        success: true,
        data,
      });

    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Internal server error",
      });
    }
  }
);

export default router;