const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); 

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

const createPromo = async (req, res) => {
  try {
    const promo = new Promo(req.body);
    await promo.save();
    res.status(201).json({ message: "Promo created and Notification sent!", promo });
  } catch (e) { res.status(500).json({ message: "Error creating promo" }); }
};

const getPromos = async (req, res) => {
  try { res.status(200).json(await Promo.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: "Error fetching promos" }); }
};

module.exports = { getDashboardStats, createPromo, getPromos };