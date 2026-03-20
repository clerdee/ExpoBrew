const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, enum: ['Brewed', 'Espresso', 'Frappuccino', 'Refreshers', 'Non-Coffee', 'Tea'] },
  image: { type: String, default: null },
  imageId: { type: String, default: null },
  countInStock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);