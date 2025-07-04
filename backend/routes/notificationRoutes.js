import express from "express";
import { getUserNotifications, markAllNotificationsRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js"; // Хэрэглэгчийг шалгах middleware

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.put("/mark-all-read", protect, markAllNotificationsRead);

export default router;