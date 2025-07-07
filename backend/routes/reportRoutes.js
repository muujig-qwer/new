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
  getReportSummary,
  userSegmentationReport,
  salesByTimeReport, // Шинээр нэмсэн
  marketBasketAnalysisReport, // Шинээр нэмсэн
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/summary", getReportSummary);
router.get("/user-segmentation", userSegmentationReport); // Шинэ endpoint
router.get("/sales-by-time", salesByTimeReport); // Шинэ endpoint
router.get("/market-basket", marketBasketAnalysisReport); // Шинэ endpoint
router.get("/", reportList);
router.get("/orders", orderReport);
router.get("/products", productReport);
router.get("/users", userReport);
router.get("/coupons", couponReport);
router.get("/revenue", revenueReport);
router.get("/delivery", deliveryReport);
router.get("/orders/csv", orderReportCsv);
router.get("/lowstock", lowStockReport);
router.get("/:id/pdf", downloadReportPdf);

export default router;