import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_super_admin: { type: Boolean, default: false },
  is_admin: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Admin', AdminSchema);
