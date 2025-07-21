import express from 'express';
import orderController from '../controllers/orderController.js';
const router = express.Router();

// POST /api/orders
router.post('/', orderController.createOrder);
// GET /api/orders
router.get('/', orderController.getOrders);
// DELETE /api/orders/:id
router.delete('/:id', orderController.deleteOrder);

export default router;