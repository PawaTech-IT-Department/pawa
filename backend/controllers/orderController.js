import { v4 as uuidv4 } from 'uuid';
import supabase from '../supabase/client.js';

// Helper: get product price from DB
async function getProductPrice(productId) {
  const { data, error } = await supabase.from('products').select('pricecents').eq('id', productId).single();
  if (error || !data) throw new Error('Product not found: ' + productId);
  return data.pricecents;
}

// Helper: estimate delivery (3 days from now)
function estimateDeliveryTime() {
  const now = new Date();
  now.setDate(now.getDate() + 3);
  return now.toISOString();
}

const orderController = {
  createOrder: async (req, res) => {
    try {
      const { cart } = req.body;
      if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: 'Cart is required and must be a non-empty array.' });
      }
      let subTotalCents = 0;
      const products = [];
      for (const item of cart) {
        const pricecents = await getProductPrice(item.productId);
        subTotalCents += pricecents * item.quantity;
        products.push({
          productId: item.productId,
          quantity: item.quantity,
          estimatedDeliveryTime: estimateDeliveryTime(),
        });
      }
      const taxCents = Math.round(subTotalCents * 0.16);
      const totalCostCents = subTotalCents + taxCents;
      const order = {
        id: uuidv4(),
        order_time: new Date().toISOString(),
        total_cost_cents: totalCostCents,
        products,
      };
      // Save order to Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  getOrders: async (req, res) => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('order_time', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      res.json({ message: 'Order deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

export default orderController; 