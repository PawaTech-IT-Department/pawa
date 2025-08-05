import express from 'express';
import inventoryController from '../controllers/inventoryController.js';

const router = express.Router();

// GET all inventories
router.get('/', inventoryController.getInventories);
// POST new inventory
router.post('/', inventoryController.createInventory);

export default router;
