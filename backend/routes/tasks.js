import express from 'express';
import taskController from '../controllers/taskController.js';

const router = express.Router();

// GET all tasks
router.get('/', taskController.getTasks);
// POST new task
router.post('/', taskController.createTask);

export default router;
