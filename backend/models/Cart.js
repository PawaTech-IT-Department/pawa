import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [CartItemSchema],
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Cart', CartSchema);
