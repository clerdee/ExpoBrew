const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('cloudinary').v2;
const { buildUserPayload } = require('./authController');

const getAllUsers = async (req, res) => {
 try { res.status(200).json(await User.find({}).select('-password')); }
  catch (e) { res.status(500).json({ message: 'Server Error: Could not fetch users.' }); }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.deleteOne();
        res.status(200).json({ message: 'User deleted successfully!' });
  } catch (e) { res.status(500).json({ message: 'Server Error: Could not delete user.' }); }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Admin accounts cannot be deactivated here.' });

    user.isActive = false;
    await user.save();

    res.status(200).json({ message: 'User deactivated successfully.' });
  } catch (e) {
    res.status(500).json({ message: 'Server Error: Could not deactivate user.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { name, email, password, phone, birthday, address } = req.body;

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'That email is already being used by another account.' });
      }
      user.email = email.toLowerCase();
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (birthday !== undefined) user.birthday = birthday;
    if (address !== undefined) user.address = address;
    if (password) user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));

    if (req.file) {
      if (user.profileImageId) await cloudinary.uploader.destroy(user.profileImageId);
      user.profileImage = req.file.path;
      user.profileImageId = req.file.filename;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully.', user: buildUserPayload(user) });
  } catch (e) {
    console.error('PROFILE UPDATE ERROR:', e);
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
  } catch (e) {
    res.status(500).json({ message: 'Server Error: Could not update favorites.' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (e) {
   res.status(500).json({ message: 'Server Error: Could not fetch favorites.' });
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

module.exports = {
  getAllUsers,
  deleteUser,
  deactivateUser,
  updateProfile,
  toggleFavorite,
  getFavorites,
  getMyNotifications,
  markAllNotificationsRead
};