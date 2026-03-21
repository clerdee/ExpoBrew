const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); 
const Promo = require('../models/Promo'); 
const Notification = require('../models/Notification');

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
    const promo = await Promo.create(req.body);

    let prefix = '';
    if (promo.type === 'Percentage') prefix = `${promo.value}% OFF: `;
    else if (promo.type === 'Fixed') prefix = `₱${promo.value} OFF: `;
    else if (promo.type === 'FreeShipping') prefix = `🚚 FREE DELIVERY: `;
    else if (promo.type === 'SpecialDeal') prefix = `🔥 MEGA DEAL: `;

    await Notification.create({
      title: `🎁 ${promo.title}`,
      message: `${prefix}${promo.description}. Use code: ${promo.code}`,
      type: 'Promo' 
    });

    res.status(201).json(promo);
  } catch (e) { 
    console.error("❌ CREATE PROMO ERROR:", e.message); 
    res.status(500).json({ message: "Failed to create promo", error: e.message }); 
  }
};

const getPromos = async (req, res) => {
  try { 
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.status(200).json(promos); 
  } catch (e) { 
    console.error("❌ GET PROMOS ERROR:", e.message);
    res.status(500).json({ message: "Failed to fetch promos", error: e.message }); 
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate an admin account.' });
    }

    user.isActive = !user.isActive; 
    await user.save();

    res.status(200).json({ 
      message: `User successfully ${user.isActive ? 'activated' : 'deactivated'}!`, 
      isActive: user.isActive 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not update user status.' });
  }
};

module.exports = { getDashboardStats, updateOrderStatus, createPromo, getPromos, deactivateUser };