import express from 'express';
import userController from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET all users/customers
router.get('/', userController.getUsers);
// User signup
router.post('/register', userController.register);
// User login
router.post('/login', userController.login);
// Get current user profile
router.get('/profile', auth, userController.getProfile);
// Update current user profile
router.put('/profile', auth, userController.updateProfile);
// Change password
router.post('/change-password', auth, userController.changePassword);
// Forgot password
router.post('/forgot-password', userController.forgotPassword);

export default router;
