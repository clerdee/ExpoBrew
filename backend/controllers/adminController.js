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

module.exports = { getDashboardStats };