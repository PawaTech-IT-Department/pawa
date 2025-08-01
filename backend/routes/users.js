import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

// GET all users/customers
router.get('/', userController.getUsers);
// User signup
router.post('/register', userController.register);
// User login
router.post('/login', userController.login);

export default router;
