import express from "express";
import {
  reportList,
  orderReport,
  productReport,
  userReport,
  couponReport,
  revenueReport,
  deliveryReport,
  orderReportCsv,
  lowStockReport,
  downloadReportPdf,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/", reportList); // root GET-ийг controller-оор дамжуулна
router.get("/orders", orderReport);
router.get("/products", productReport);
router.get("/users", userReport);
router.get("/coupons", couponReport);
router.get("/revenue", revenueReport);
router.get("/delivery", deliveryReport);
router.get("/orders/csv", orderReportCsv);
router.get("/lowstock", lowStockReport);
router.get("/:id/pdf", downloadReportPdf); // ← зөвхөн энэ

export default router;