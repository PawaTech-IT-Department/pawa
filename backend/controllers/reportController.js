import Admin from '../models/Admin.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import Task from '../models/Task.js';

const reportController = {
  // Generate a summary report for all entities
  getSummary: async (req, res) => {
    try {
      const [admins, products, orders, users, inventories, tasks] = await Promise.all([
        Admin.find(),
        Product.find(),
        Order.find(),
        User.find(),
        Inventory.find(),
        Task.find(),
      ]);
      res.json({
        adminCount: admins.length,
        productCount: products.length,
        orderCount: orders.length,
        userCount: users.length,
        inventoryCount: inventories.length,
        taskCount: tasks.length,
        admins,
        products,
        orders,
        users,
        inventories,
        tasks,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate report', details: err.message });
    }
  },
};

export default reportController;
