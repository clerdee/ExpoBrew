const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); 

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ status: { $in: ['Pending', 'Preparing', 'Ready'] } });
    const lowStock = await Product.countDocuments({ countInStock: { $lte: 5 } });
    const totalUsers = await User.countDocuments({ isAdmin: false });
    
    const revObj = await Order.aggregate([{ $match: { status: 'Completed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    const totalRevenue = revObj.length > 0 ? revObj[0].total : 0;

    res.status(200).json({ totalOrders, activeOrders, lowStock, totalRevenue, totalUsers });
  } catch (e) { res.status(500).json({ message: "Server Error: Could not fetch dashboard stats." }); }
};

module.exports = { getDashboardStats };