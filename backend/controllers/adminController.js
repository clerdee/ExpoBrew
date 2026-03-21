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

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = req.body.status || order.status;
    await order.save();

    await Notification.create({
      user: order.user,
      title: "Order Update",
      message: `Your order #${order._id.slice(-6).toUpperCase()} is now ${order.status}!`,
      type: 'Order'
    });

    res.status(200).json(order);
  } catch (e) { res.status(500).json({ message: "Error" }); }
};

const createPromo = async (req, res) => {
  try {
    const promo = new Promo(req.body);
    await promo.save();

    await Notification.create({
      title: `New Promo: ${promo.title}`,
      message: `${promo.description}. Use code: ${promo.code}`,
      type: 'Promo'
    });

    res.status(201).json(promo);
  } catch (e) { res.status(500).json({ message: "Error" }); }
};

const getPromos = async (req, res) => {
  try { res.status(200).json(await Promo.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: "Error fetching promos" }); }
};

module.exports = { getDashboardStats, updateOrderStatus, createPromo, getPromos };