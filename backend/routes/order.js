import express from 'express'
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getAllOrders
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// protect middleware-г POST / (захиалга үүсгэх) дээр нэмнэ
router.post('/', protect, createOrder)
router.get('/', protect, getOrders)
router.put('/:id', protect, updateOrderStatus)
router.delete('/:id', protect, deleteOrder)
router.get('/admin/orders', protect, admin, getAllOrders)

export default router
