import express from 'express';
import taskController from '../controllers/taskController.js';

const router = express.Router();

// GET all tasks
router.get('/', taskController.getTasks);

export default router;
