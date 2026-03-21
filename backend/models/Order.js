const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  orderItems: [{
    name: { type: String, required: true }, qty: { type: Number, required: true },
    image: { type: String }, price: { type: Number, required: true },
    customizations: { type: Object }
  }],
  shippingAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  promoCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'] }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);