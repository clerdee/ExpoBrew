const express = require('express');
const router = express.Router();
const { getMyReview, updateReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-review', protect, getMyReview);
router.put('/:id', protect, updateReview);

module.exports = router;
