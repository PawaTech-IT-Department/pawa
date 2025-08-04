import express from 'express';
import orderController from '../controllers/orderController.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// POST /api/orders
router.post('/', auth, orderController.createOrder);
// GET /api/orders
router.get('/', orderController.getOrders);
// GET /api/orders/my (user's own orders)
router.get('/my', auth, orderController.getMyOrders);
// DELETE /api/orders/:id
router.delete('/:id', orderController.deleteOrder);

export default router;