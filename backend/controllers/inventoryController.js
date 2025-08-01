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
};

export default inventoryController;
