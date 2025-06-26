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

router.post('/', createOrder)
router.get('/', getOrders)
router.put('/:id', updateOrderStatus)
router.delete('/:id', deleteOrder)
router.get('/admin/orders', protect, admin, getAllOrders)

export default router
