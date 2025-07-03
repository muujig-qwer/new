import express from 'express';
import { createDeliveryStaff, getDeliveryStaff, getDeliveryOrders, updateOrderStatus } from '../controllers/deliveryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, createDeliveryStaff);
router.get('/', protect, admin, getDeliveryStaff);
router.get('/orders', protect, getDeliveryOrders);
router.patch('/orders/:orderId/status', protect, updateOrderStatus);


export default router;