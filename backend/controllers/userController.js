const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('cloudinary').v2;
const { buildUserPayload } = require('./authController');

const getAllUsers = async (req, res) => {
  try { res.status(200).json(await User.find({}).select('-password')); } 
  catch (e) { res.status(500).json({ message: "Server Error: Could not fetch users." }); }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (e) { res.status(500).json({ message: "Server Error: Could not delete user." }); }
};

const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    if (user.favorites.includes(productId)) {
      user.favorites = user.favorites.filter(id => id.toString() !== productId);
      await user.save();
      return res.status(200).json({ message: 'Removed from favorites', favorites: user.favorites });
    }

    user.favorites.push(productId);
    await user.save();
    return res.status(200).json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (e) {
    res.status(500).json({ message: 'Server Error: Could not update favorites.' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (e) {
    res.status(500).json({ message: "Server Error: Could not fetch favorites." });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ $or: [{ user: req.user._id }, { user: null }] }).sort({ createdAt: -1 });
    res.status(200).json(notifs);
  } catch (e) { res.status(500).json({ message: 'Error fetching notifications' }); }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ user: req.user._id }, { user: null }], isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (e) { res.status(500).json({ message: 'Error updating notifications' }); }
};

module.exports = { getAllUsers, deleteUser, toggleFavorite, getFavorites, getMyNotifications, markAllNotificationsRead };