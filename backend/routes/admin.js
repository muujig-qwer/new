import express from 'express';
import { getMonthlyStats, assignOrderToDelivery, getAllOrders } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/monthly-stats', /*protect, admin,*/ getMonthlyStats);
router.patch('/orders/:orderId/assign', protect, admin, assignOrderToDelivery)
router.get('/orders', protect, admin, getAllOrders);

export default router;