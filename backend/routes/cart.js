import express from 'express';
import cartController from '../controllers/cartController.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// GET current user's cart
router.get('/my', auth, cartController.getMyCart);
// PUT update current user's cart
router.put('/my', auth, cartController.updateMyCart);

export default router;
