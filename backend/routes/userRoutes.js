const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const {
  getAllUsers,
  deleteUser,
  deactivateUser,
  updateProfile,
  toggleFavorite,
  getFavorites,
  getMyNotifications,
  markAllNotificationsRead
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllUsers);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/:id/deactivate', protect, admin, deactivateUser);
router.delete('/:id', protect, admin, deleteUser);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:productId', protect, toggleFavorite);
router.get('/notifications', protect, getMyNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead);

module.exports = router;
