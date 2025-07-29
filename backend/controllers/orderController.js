import { v4 as uuidv4 } from "uuid";
import supabase from "../supabase/client.js";

// Helper: get product price from DB
async function getProductPrice(productId) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("pricecents")
      .eq("id", productId)
      .single();

    if (error || !data) {
      console.error("Error fetching product price:", { error, productId });
      throw new Error(`Product not found: ${productId}`);
    }

    if (!data.pricecents) {
      console.error("Product price is missing or zero:", { productId, data });
      throw new Error(`Invalid price for product: ${productId}`);
    }

    return data.pricecents;
  } catch (error) {
    console.error("Error in getProductPrice:", error);
    throw error; // Re-throw to be handled by the caller
  }
}

// Helper: estimate delivery (3 days from now)
function estimateDeliveryTime() {
  const now = new Date();
  now.setDate(now.getDate() + 3);
  return now.toISOString();
}

// Helper: get product details (name, image) from DB
async function getProductDetails(productId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('name, image')
      .eq('id', productId)
      .single();
    if (error || !data) {
      return null;
    }
    return data;
  } catch (error) {
    return null;
  }
}

const orderController = {
  createOrder: async (req, res) => {
    const client = supabase;
    try {
      console.log(
        "Received order creation request:",
        JSON.stringify(req.body, null, 2)
      );

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

      // Input validation
      if (!Array.isArray(cart) || cart.length === 0) {
        return res
          .status(400)
          .json({ error: "Cart is required and must be a non-empty array." });
      }
      if (!deliveryAddress || typeof deliveryAddress !== "string") {
        return res
          .status(400)
          .json({ error: "Valid delivery address is required." });
      }
      if (paymentStatus !== "paid") {
        return res.status(400).json({
          error:
            "Order cannot be saved unless payment is confirmed (status: paid).",
        });
      }

      // Log cart items for debugging
      console.log("Processing cart with items:", JSON.stringify(cart, null, 2));

      // Verify all products exist and get their prices
      const cartWithPrices = await Promise.all(
        cart.map(async (item) => {
          try {
            const price = await getProductPrice(item.productId);
            console.log(`Fetched price for product ${item.productId}:`, price);
            return {
              ...item,
              priceAtTimeOfOrder: price,
            };
          } catch (error) {
            console.error(
              `Error processing product ${item.productId || "unknown"}:`,
              error
            );
            throw new Error(
              `Failed to process product: ${item.productId} - ${error.message}`
            );
          }
        })
      );

      // Calculate total amount from cart items
      const calculatedTotal = cartWithPrices.reduce((total, item) => {
        return total + item.priceAtTimeOfOrder * item.quantity;
      }, 0);

      // Calculate tax and total
      const taxCents = Math.round(calculatedTotal * 0.16);
      const totalCents = calculatedTotal + taxCents;

      console.log("Order totals:", {
        subtotal: calculatedTotal,
        tax: taxCents,
        total: totalCents,
      });

      // Prepare order items
      const orderItems = cartWithPrices.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time_of_order: item.priceAtTimeOfOrder,
        estimated_delivery_time: estimateDeliveryTime(),
      }));

      // Set the subtotal
      const subTotalCents = calculatedTotal;

      console.log("Order items prepared:", JSON.stringify(orderItems, null, 2));
      const orderId = uuidv4();
      const orderTime = new Date().toISOString();

      // Start a transaction
      const { data: orderData, error: orderError } = await client
        .from("orders")
        .insert({
          id: orderId,
          order_time: orderTime,
          total_cost_cents: totalCents,
          delivery_address: deliveryAddress,
          payment_status: paymentStatus,
          mpesa_checkout_id: mpesaCheckoutId,
          payment_method: paymentMethod,
          amount: totalCents,
          mpesa_receipt_number: mpesaReceiptNumber,
          transaction_date: transactionDate,
          subtotal_cents: subTotalCents,
          tax_cents: taxCents,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw new Error("Failed to create order in database");
      }

      // Insert order items
      // 1. Prepare order items directly from the cart
      const orderItemsWithOrderId = cart.map((item) => {
        // Create a new object with only the fields that exist in the database
        const dbItem = {
          order_id: orderId,
          product_id: item.productId, // Access productId directly from cart item
          quantity: item.quantity,
          price_at_time_of_order: item.priceAtTimeOfOrder, // Access priceAtTimeOfOrder directly
          estimated_delivery_time:
            item.estimatedDeliveryTime || estimateDeliveryTime(),
        };

        console.log("Prepared order item:", dbItem);
        return dbItem;
      });

      console.log("All order items for DB:", orderItemsWithOrderId);

      // 2. Then insert the order items
      try {
        const { error: itemsError } = await client
          .from("order_items")
          .insert(orderItemsWithOrderId);

        if (itemsError) {
          console.error("Detailed items error:", {
            code: itemsError.code,
            message: itemsError.message,
            details: itemsError.details,
            hint: itemsError.hint,
          });
          throw new Error("Failed to create order items in database");
        }
        console.log("Order items inserted successfully");
      } catch (error) {
        console.error("Error during order items insert:", error);
        // Try to delete the order if items couldn't be created
        await client.from("orders").delete().eq("id", orderId);
        throw error;
      }

      // Fetch the complete order with items
      const { data: completeOrder, error: fetchError } = await client
        .from("orders")
        .select(
          `
          *,
          order_items(*)
        `
        )
        .eq("id", orderId)
        .single();

      if (fetchError) throw fetchError;

      res.status(201).json({
        success: true,
        order: completeOrder,
      });
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({
        success: false,
        error: "Failed to create order",
        details: err.message,
      });
    }
  },

  getOrders: async (req, res) => {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/';
      // Attach product details (name, image) to each order item
      const ordersWithProductDetails = await Promise.all((orders || []).map(async (order) => {
        const detailedItems = await Promise.all((order.order_items || []).map(async (item) => {
          const productDetails = await getProductDetails(item.product_id);
          let productImage = productDetails && productDetails.image ? productDetails.image : null;
          if (productImage) {
            // If the image path is relative, prepend BASE_URL
            if (!productImage.startsWith('http://') && !productImage.startsWith('https://')) {
              if (productImage.startsWith('img/') || productImage.startsWith('images/')) {
                productImage = BASE_URL + productImage;
              } else {
                productImage = BASE_URL + 'img/' + productImage;
              }
            }
          } else {
            productImage = 'https://img.icons8.com/?size=100&id=46720&format=png&color=000000';
          }
          return {
            ...item,
            productName: productDetails && productDetails.name ? productDetails.name : 'Unknown Product',
            productImage,
          };
        }));
        return { ...order, order_items: detailedItems };
      }));

      res.json({
        success: true,
        orders: ordersWithProductDetails || [],
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
        details: err.message,
      });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;

      const { data: order, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      res.json({
        success: true,
        order,
      });
    } catch (err) {
      console.error("Error fetching order:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch order",
        details: err.message,
      });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;

      // Delete order items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", id);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (orderError) throw orderError;

      res.json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting order:", err);
      res.status(500).json({
        success: false,
        error: "Failed to delete order",
        details: err.message,
      });
    }
  },
};

export default orderController;
