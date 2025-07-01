import express from 'express';
import { createCoupon, applyCoupon, listCoupons, getUserCoupons } from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Админ купон үүсгэх
router.post('/create', protect, admin, createCoupon);

// Купон ашиглах (user)
router.post('/apply', applyCoupon);

// Купоныг жагсаах
router.get('/list', protect, admin, listCoupons);

// Хэрэглэгчийн купонуудыг авах
router.get('/user', protect, getUserCoupons);

export default router;