// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
  imageUrl: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
