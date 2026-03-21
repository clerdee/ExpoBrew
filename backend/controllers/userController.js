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
    if (user.profileImageId) await cloudinary.uploader.destroy(user.profileImageId);
    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (e) { res.status(500).json({ message: "Server Error: Could not delete user." }); }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { name, email, phone, birthday, addresses, currentPassword, newPassword } = req.body;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required.' });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid current password.' });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (req.file) {
      if (user.profileImageId) await cloudinary.uploader.destroy(user.profileImageId);
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'ExpoBrew/Profiles' });
      user.profileImage = result.secure_url;
      user.profileImageId = result.public_id;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (birthday !== undefined) user.birthday = birthday;
    if (addresses) user.addresses = typeof addresses === 'string' ? JSON.parse(addresses) : addresses;

    await user.save();
    res.status(200).json(buildUserPayload(user));
  } catch (e) { 
    console.error(e); 
    res.status(500).json({ message: 'Server Error: Could not update profile.' }); 
  }
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
  } catch (e) { res.status(500).json({ message: 'Server Error: Could not update favorites.' }); }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (e) { res.status(500).json({ message: "Server Error: Could not fetch favorites." }); }
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

module.exports = { getAllUsers, deleteUser, updateUserProfile, toggleFavorite, getFavorites, getMyNotifications, markAllNotificationsRead };