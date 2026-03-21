const express = require('express');
const router = express.Router();
const { getDashboardStats, createPromo, getPromos } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboardStats);
router.route('/promos').get(protect, admin, getPromos).post(protect, admin, createPromo);

module.exports = router;