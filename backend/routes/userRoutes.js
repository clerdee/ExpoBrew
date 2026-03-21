const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, toggleFavorite, getFavorites, getMyNotifications, markAllNotificationsRead } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware'); 

router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:productId', protect, toggleFavorite);
router.get('/notifications', protect, getMyNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead);

module.exports = router;