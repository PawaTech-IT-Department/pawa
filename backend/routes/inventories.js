import express from 'express';
import inventoryController from '../controllers/inventoryController.js';

const router = express.Router();

// GET all inventories
router.get('/', inventoryController.getInventories);

export default router;
