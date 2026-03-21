const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Percentage', 'Fixed', 'FreeShipping', 'SpecialDeal'], default: 'Percentage' },
  value: { type: Number, default: 0 }, 
  code: { type: String, required: true, unique: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Promo', promoSchema);