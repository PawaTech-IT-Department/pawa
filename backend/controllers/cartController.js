import Cart from '../models/Cart.js';

const cartController = {
  // Get current user's cart
  getMyCart: async (req, res) => {
    try {
      const userId = req.user?._id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      let cart = await Cart.findOne({ user: userId });
      if (!cart) cart = await Cart.create({ user: userId, items: [] });
      res.json({ success: true, cart });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch cart', details: err.message });
    }
  },
  // Update current user's cart
  updateMyCart: async (req, res) => {
    try {
      const userId = req.user?._id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { items } = req.body;
      let cart = await Cart.findOneAndUpdate(
        { user: userId },
        { items },
        { new: true, upsert: true }
      );
      res.json({ success: true, cart });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update cart', details: err.message });
    }
  },
};

export default cartController;
