const express = require('express');
const router = express.Router();
const { getDashboardStats, createPromo, getPromos, getUsers, deactivateUser, getAllReviews, deleteReview, updateOrderStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboardStats);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.route('/promos').get(protect, admin, getPromos).post(protect, admin, createPromo);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/deactivate', protect, admin, deactivateUser);
router.route('/reviews').get(protect, admin, getAllReviews);
router.route('/reviews/:id').delete(protect, admin, deleteReview);

module.exports = router;