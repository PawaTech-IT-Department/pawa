import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  location: { type: String },
}, { timestamps: true });

export default mongoose.model('Inventory', InventorySchema);
