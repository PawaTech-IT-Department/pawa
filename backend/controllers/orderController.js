import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Helper: get product price from DB
async function getProductPrice(productId) {
  const product = await Product.findById(productId);
  if (!product) throw new Error(`Product not found: ${productId}`);
  if (!product.pricecents) throw new Error(`Invalid price for product: ${productId}`);
  return product.pricecents;
}

// Helper: estimate delivery (3 days from now)
function estimateDeliveryTime() {
  const now = new Date();
  now.setDate(now.getDate() + 3);
  return now.toISOString();
}

// Helper: get product details (name, image) from DB
async function getProductDetails(productId) {
  const product = await Product.findById(productId);
  if (!product) return null;
  return { name: product.name, image: product.image };
}

const orderController = {
  createOrder: async (req, res) => {
    try {
      const {
        cart,
        deliveryAddress,
        paymentStatus = "pending",
        mpesaCheckoutId,
        paymentMethod = "M-Pesa",
        amount,
        mpesaReceiptNumber,
        transactionDate,
        subtotalCents,
      } = req.body;

      if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: "Cart is required and must be a non-empty array." });
      }
      if (!deliveryAddress || typeof deliveryAddress !== "string") {
        return res.status(400).json({ error: "Valid delivery address is required." });
      }
      if (paymentStatus !== "paid") {
        return res.status(400).json({ error: "Order cannot be saved unless payment is confirmed (status: paid)." });
      }

      // Verify all products exist and get their prices
      const cartWithPrices = await Promise.all(
        cart.map(async (item) => {
          const price = await getProductPrice(item.productId);
          return {
            ...item,
            priceAtTimeOfOrder: price,
          };
        })
      );

      // Calculate total amount from cart items
      const calculatedTotal = cartWithPrices.reduce((total, item) => {
        return total + item.priceAtTimeOfOrder * item.quantity;
      }, 0);
      const taxCents = Math.round(calculatedTotal * 0.16);
      const totalCents = calculatedTotal + taxCents;

      // Prepare order items
      const orderItems = cartWithPrices.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time_of_order: item.priceAtTimeOfOrder,
        estimated_delivery_time: estimateDeliveryTime(),
      }));

      // Create order in MongoDB
      const order = new Order({
        user_id: req.user?._id, // You may need to adjust this based on your auth
        order_items: orderItems,
        order_time: new Date(),
        total_cost_cents: totalCents,
        delivery_address: deliveryAddress,
        payment_status: paymentStatus,
        mpesa_checkout_id: mpesaCheckoutId,
        payment_method: paymentMethod,
        amount: totalCents,
        mpesa_receipt_number: mpesaReceiptNumber,
        transaction_date: transactionDate,
        subtotal_cents: calculatedTotal,
        tax_cents: taxCents,
      });
      await order.save();

      res.status(201).json({ success: true, order });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to create order", details: err.message });
    }
  },

  getOrders: async (req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 }).populate('order_items.product_id');
      // Attach product details to each order item
      const ordersWithProductDetails = await Promise.all(
        orders.map(async (order) => {
          const detailedItems = await Promise.all(
            order.order_items.map(async (item) => {
              const productDetails = await getProductDetails(item.product_id);
              let productImage = productDetails?.image || null;
              if (productImage && !productImage.startsWith('http')) {
                productImage = `http://localhost:5000/img/${productImage}`;
              }
              return {
                ...item.toObject(),
                productName: productDetails?.name || 'Unknown Product',
                productImage: productImage || 'https://img.icons8.com/?size=100&id=46720&format=png&color=000000',
              };
            })
          );
          return { ...order.toObject(), order_items: detailedItems };
        })
      );
      res.json({ success: true, orders: ordersWithProductDetails });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to fetch orders", details: err.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id).populate('order_items.product_id');
      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }
      res.json({ success: true, order });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to fetch order", details: err.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }
      res.json({ success: true, message: "Order deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to delete order", details: err.message });
    }
  },

  // Get orders for the authenticated user
  getMyOrders: async (req, res) => {
    try {
      const userId = req.user?._id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const orders = await Order.find({ user_id: userId }).sort({ createdAt: -1 }).populate('order_items.product_id');
      const ordersWithProductDetails = await Promise.all(
        orders.map(async (order) => {
          const detailedItems = await Promise.all(
            order.order_items.map(async (item) => {
              const productDetails = await getProductDetails(item.product_id);
              let productImage = productDetails?.image || null;
              if (productImage && !productImage.startsWith('http')) {
                productImage = `http://localhost:5000/img/${productImage}`;
              }
              return {
                ...item.toObject(),
                productName: productDetails?.name || 'Unknown Product',
                productImage: productImage || 'https://img.icons8.com/?size=100&id=46720&format=png&color=000000',
              };
            })
          );
          return { ...order.toObject(), order_items: detailedItems };
        })
      );
      res.json({ success: true, orders: ordersWithProductDetails });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user orders', details: err.message });
    }
  },
};

export default orderController;
