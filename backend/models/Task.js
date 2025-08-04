import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  due_date: { type: Date },
}, { timestamps: true });

export default mongoose.model('Task', TaskSchema);
