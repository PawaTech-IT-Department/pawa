import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price_at_time_of_order: { type: Number, required: true },
  estimated_delivery_time: { type: String },
});

const OrderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_items: [OrderItemSchema],
  order_time: { type: Date, default: Date.now },
  total_cost_cents: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
