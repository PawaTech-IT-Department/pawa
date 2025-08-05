import express from 'express';
import reportController from '../controllers/reportController.js';

const router = express.Router();

// GET summary report
router.get('/summary', reportController.getSummary);

export default router;
