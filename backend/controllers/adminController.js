const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Promo = require('../models/Promo');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const { sendExpoPushNotifications } = require('../utils/pushNotifications');

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ status: { $in: ['Pending', 'Preparing', 'Ready'] } });
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const revenue = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    return res.status(200).json({
      totalOrders,
      activeOrders,
      totalProducts,
      totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
      totalCustomers,
      totalAdmins,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status || order.status;
    await order.save();
    await Notification.create({
      user: order.user,
      title: 'Order Update',
      message: `Your order #${order._id.slice(-6).toUpperCase()} is now ${order.status}!`,
      type: 'Order',
      relatedId: order._id,
    });

    return res.status(200).json(order);
  } catch (error) {
    console.error('Admin update order status error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const createPromo = async (req, res) => {
  try {
    const promo = await Promo.create(req.body);
    const prefix =
      promo.type === 'Percentage'
        ? `${promo.value}% OFF: `
        : promo.type === 'Fixed'
          ? `₱${promo.value} OFF: `
          : promo.type === 'FreeShipping'
            ? '🚚 FREE DELIVERY: '
            : '🔥 MEGA DEAL: ';

    await Notification.create({
      title: `🎁 ${promo.title}`,
      message: `${prefix}${promo.description}. Use code: ${promo.code}`,
      type: 'Promo',
      relatedId: promo._id,
    });

    const usersWithPushTokens = await User.find({
      role: 'customer',
      expoPushToken: { $exists: true, $ne: null },
      isActive: true,
    }).select('expoPushToken');

    const pushResult = await sendExpoPushNotifications(
      usersWithPushTokens.map((user) => ({
        to: user.expoPushToken,
        title: `🎁 ${promo.title}`,
        body: `${prefix}${promo.description}`,
        data: {
          type: 'promo',
          promoId: String(promo._id),
          title: promo.title,
          description: promo.description,
          code: promo.code,
          promoType: promo.type,
          value: promo.value,
          validUntil: promo.validUntil,
        },
      }))
    );

    if (pushResult.ticketErrors.length || pushResult.receiptErrors.length) {
      console.log('Promo push notification issues:', pushResult);
    }

    return res.status(201).json(promo);
  } catch (error) {
    console.error('Create promo error:', error);
    return res.status(500).json({ message: 'Failed', error: error.message });
  }
};

const getPromos = async (req, res) => {
  try {
    return res.status(200).json(await Promo.find().sort({ createdAt: -1 }));
  } catch (error) {
    console.error('Get promos error:', error);
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate admin.' });
    }

    user.isActive = !user.isActive;
    await user.save();
    return res.status(200).json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'}!`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name profileImage email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Get all reviews error:', error);
    return res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
};

const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ message: 'Failed to delete review.' });
  }
};

module.exports = {
  getDashboardStats,
  updateOrderStatus,
  createPromo,
  getPromos,
  deactivateUser,
  getAllReviews,
  deleteReview,
};
