const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
};

const getMyReview = async (req, res) => {
  try {
    const { productId, orderId } = req.query;
    const review = await Review.findOne({ user: req.user._id, product: productId, order: orderId });
    res.status(200).json(review || null);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch your review.' });
  }
};

const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment = '', customizations } = req.body;
    const { productId } = req.params;

    if (!orderId || !rating) return res.status(400).json({ message: 'Order and rating are required.' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const order = await Order.findOne({ _id: orderId, user: req.user._id, status: 'Completed' });
    if (!order) return res.status(403).json({ message: 'Only completed purchased products can be reviewed.' });

    const purchasedItem = order.orderItems.find(item => (item.product && item.product.toString() === productId) || item.name === product.name);
    if (!purchasedItem) return res.status(403).json({ message: 'You can only review products from your completed orders.' });

    const existingReview = await Review.findOne({ user: req.user._id, product: productId, order: orderId });
    if (existingReview) return res.status(400).json({ message: 'You already reviewed this product for that order.', reviewId: existingReview._id });

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating: Number(rating),
      comment: comment.trim(),
      customizations: customizations || {}
    });

    res.status(201).json(review);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: 'You already reviewed this product for that order.' });
    res.status(500).json({ message: 'Failed to create review.' });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'You can only edit your own reviews.' });

    review.rating = Number(req.body.rating || review.rating);
    review.comment = req.body.comment !== undefined ? req.body.comment.trim() : review.comment;
    if (req.body.customizations) review.customizations = req.body.customizations; 

    await review.save();
    res.status(200).json(review);
  } catch (e) {
    res.status(500).json({ message: 'Failed to update review.' });
  }
};

module.exports = { getProductReviews, getMyReview, createReview, updateReview };