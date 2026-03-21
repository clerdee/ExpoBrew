const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, toggleFavorite, getFavorites } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware'); 

router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:productId', protect, toggleFavorite);

module.exports = router;