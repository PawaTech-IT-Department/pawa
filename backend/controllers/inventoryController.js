import Inventory from '../models/Inventory.js';

const inventoryController = {
  // List all inventories
  getInventories: async (req, res) => {
    try {
      const inventories = await Inventory.find();
      res.json({ inventories });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch inventories', details: err.message });
    }
  },

  // Add new inventory
  createInventory: async (req, res) => {
    try {
      const { product_id, quantity, category, location } = req.body;
      if (!product_id || typeof quantity !== 'number') {
        return res.status(400).json({ error: 'product_id and quantity are required' });
      }
      const inventory = new Inventory({ product_id, quantity, category, location });
      await inventory.save();
      res.status(201).json({ inventory });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add inventory', details: err.message });
    }
  },
};

export default inventoryController;
