const express = require('express');
const router = express.Router();
const { getProductReviews, getMyReview, createReview, updateReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/product/:productId').get(getProductReviews).post(protect, createReview);
router.route('/my-review').get(protect, getMyReview);
router.route('/:id').put(protect, updateReview);

module.exports = router;