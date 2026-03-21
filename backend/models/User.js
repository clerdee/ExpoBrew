const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },

  phone: { type: String, default: '' },
  birthday: { type: String, default: '' },
  address: { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  profileImage: { type: String, default: null },
  profileImageId: { type: String, default: null },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
