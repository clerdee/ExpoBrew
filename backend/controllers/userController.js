const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const { buildUserPayload } = require('./authController');
const { isExpoPushToken } = require('../utils/pushNotifications');

const normalizePushTokens = (user) => {
  const tokens = new Set((user.expoPushTokens || []).filter(Boolean));
  if (user.expoPushToken) tokens.add(user.expoPushToken);
  return [...tokens];
};

const getAllUsers = async (req, res) => {
  try {
    return res.status(200).json(await User.find({}).select('-password'));
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ message: 'Server Error.' });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }

    user.expoPushTokens = normalizePushTokens(user);
    return res.status(200).json(buildUserPayload(user));
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (user.profileImageId) {
      await cloudinary.uploader.destroy(user.profileImageId);
    }

    await user.deleteOne();
    return res.status(200).json({ message: 'Deleted!' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }

    const { name, email, phone, birthday, addresses, currentPassword, newPassword } = req.body;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (req.file) {
      if (user.profileImageId) {
        await cloudinary.uploader.destroy(user.profileImageId);
      }
      user.profileImage = req.file.path;
      user.profileImageId = req.file.filename;
    }

    if (name !== undefined) user.name = String(name).trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (birthday !== undefined) user.birthday = birthday;
    if (addresses !== undefined) {
      const parsedAddresses = typeof addresses === 'string' ? JSON.parse(addresses) : addresses;
      user.addresses = Array.isArray(parsedAddresses)
        ? parsedAddresses.filter((address) => typeof address === 'string' && address.trim())
        : [];
    }

    user.expoPushTokens = normalizePushTokens(user);
    await user.save();
    return res.status(200).json(buildUserPayload(user));
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ message: error.message || 'Error' });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.params;

    const product = await Product.findById(productId).select('_id');
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const favoriteIds = (user.favorites || []).map((id) => id.toString());

    if (favoriteIds.includes(productId)) {
      user.favorites = user.favorites.filter((id) => id.toString() !== productId);
      await user.save();
      return res.status(200).json({ message: 'Removed', favorites: user.favorites.map((id) => id.toString()) });
    }

    user.favorites.push(productId);
    await user.save();
    return res.status(200).json({ message: 'Added', favorites: user.favorites.map((id) => id.toString()) });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    const favorites = (user?.favorites || []).filter(Boolean);
    return res.status(200).json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ $or: [{ user: req.user._id }, { user: null }] }).sort({ createdAt: -1 });
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ user: req.user._id }, { user: null }], isRead: false },
      { $set: { isRead: true } }
    );
    return res.status(200).json({ message: 'Read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const savePushToken = async (req, res) => {
  try {
    const token = req.body?.token?.trim?.() || null;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (token && !isExpoPushToken(token)) {
      return res.status(400).json({ message: 'Invalid Expo push token.' });
    }

    const tokens = new Set(normalizePushTokens(user));

    if (token) {
      tokens.add(token);
      user.expoPushToken = token;
    } else {
      user.expoPushToken = null;
    }

    user.expoPushTokens = [...tokens];
    await user.save();
    return res.status(200).json({ message: token ? 'Token saved' : 'Token cleared' });
  } catch (error) {
    console.error('Token save error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const removePushToken = async (req, res) => {
  try {
    const token = req.body?.token?.trim?.() || null;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }

    const remainingTokens = normalizePushTokens(user).filter((savedToken) => savedToken !== token);
    user.expoPushTokens = remainingTokens;
    if (!token || user.expoPushToken === token) {
      user.expoPushToken = remainingTokens[0] || null;
    }

    await user.save();
    return res.status(200).json({ message: 'Token removed' });
  } catch (error) {
    console.error('Token remove error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

module.exports = {
  getAllUsers,
  getMyProfile,
  deleteUser,
  updateUserProfile,
  toggleFavorite,
  getFavorites,
  getMyNotifications,
  markAllNotificationsRead,
  savePushToken,
  removePushToken,
};
