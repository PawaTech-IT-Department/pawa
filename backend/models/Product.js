import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  rating: { type: Number, default: 0 },
  pricecents: { type: Number, required: true },
  keywords: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stock: { type: Number, default: 0 },
  brand: { type: String },
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);
