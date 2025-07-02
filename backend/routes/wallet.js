import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addMoneyToWallet, getWalletBalance } from "../controllers/walletController.js";

const router = express.Router();

router.post("/add", protect, addMoneyToWallet);
router.get("/balance", protect, getWalletBalance);

export default router;