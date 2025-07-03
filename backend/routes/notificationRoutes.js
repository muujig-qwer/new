import express from "express";
import { getUserNotifications } from "../controllers/notificationController.js";
import {  protect } from "../middleware/authMiddleware.js"; // Хэрэглэгчийг шалгах middleware

const router = express.Router();

router.get("/", protect, getUserNotifications);

export default router;