const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: String,
  duration: String,
  schedule: String,
  price: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
