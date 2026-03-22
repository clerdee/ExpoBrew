const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); 
const Promo = require('../models/Promo'); 
const Notification = require('../models/Notification');
const Review = require('../models/Review');

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ status: { $in: ['Pending', 'Preparing', 'Ready'] } });
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });   
    const revObj = await Order.aggregate([{ $match: { status: 'Completed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    const totalRevenue = revObj.length > 0 ? revObj[0].total : 0;
    res.status(200).json({ totalOrders, activeOrders, totalProducts, totalRevenue, totalCustomers, totalAdmins });
  } catch (e) { res.status(500).json({ message: "Server Error" }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = req.body.status || order.status;
    await order.save();
    await Notification.create({ user: order.user, title: "Order Update", message: `Your order #${order._id.slice(-6).toUpperCase()} is now ${order.status}!`, type: 'Order' });
    res.status(200).json(order);
  } catch (e) { res.status(500).json({ message: "Error" }); }
};

const createPromo = async (req, res) => {
  try {
    const promo = await Promo.create(req.body);
    let prefix = promo.type === 'Percentage' ? `${promo.value}% OFF: ` : promo.type === 'Fixed' ? `₱${promo.value} OFF: ` : promo.type === 'FreeShipping' ? `🚚 FREE DELIVERY: ` : `🔥 MEGA DEAL: `;
    await Notification.create({ title: `🎁 ${promo.title}`, message: `${prefix}${promo.description}. Use code: ${promo.code}`, type: 'Promo' });
    res.status(201).json(promo);
  } catch (e) { res.status(500).json({ message: "Failed", error: e.message }); }
};

const getPromos = async (req, res) => {
  try { res.status(200).json(await Promo.find().sort({ createdAt: -1 })); } 
  catch (e) { res.status(500).json({ message: "Error", error: e.message }); }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot deactivate admin.' });
    user.isActive = !user.isActive; await user.save();
    res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}!`, isActive: user.isActive });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name profileImage') 
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (e) { res.status(500).json({ message: 'Failed to fetch reviews.' }); }
};

const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (e) { res.status(500).json({ message: 'Failed to delete review.' }); }
};

module.exports = { getDashboardStats, updateOrderStatus, createPromo, getPromos, deactivateUser, getAllReviews, deleteReview };