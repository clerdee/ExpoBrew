const express = require('express');
const router = express.Router();
const { getDashboardStats, createPromo, getPromos, deletePromo, deactivateUser, getAllReviews, deleteReview, updateOrderStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const { getAllUsers } = require('../controllers/userController');

router.get('/dashboard', protect, admin, getDashboardStats);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.route('/promos').get(protect, admin, getPromos).post(protect, admin, createPromo);
router.route('/promos/:id').delete(protect, admin, deletePromo);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/deactivate', protect, admin, deactivateUser);
router.route('/reviews').get(protect, admin, getAllReviews);
router.route('/reviews/:id').delete(protect, admin, deleteReview);

module.exports = router;
