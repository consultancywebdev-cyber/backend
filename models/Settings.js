const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName: String,
  tagline: String,
  email: String,
  phone: String,
  address: String,
  facebook: String,
  instagram: String,
  twitter: String,
  linkedin: String,
  tiktok: String,
  whatsapp: String
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
