const mongoose = require('mongoose');
const promoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discountPercent: { type: Number, required: true },
  code: { type: String, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Promo', promoSchema);