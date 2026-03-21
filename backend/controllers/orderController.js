const Order = require('../models/Order');
const Notification = require('../models/Notification'); 

const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice, shippingAddress, paymentMethod } = req.body;
    if (orderItems?.length === 0) return res.status(400).json({ message: "No order items" });
    const order = new Order({ user: req.user._id, orderItems, totalPrice, shippingAddress, paymentMethod });
    res.status(201).json(await order.save());
  } catch (e) { res.status(500).json({ message: "Server Error", error: e.message }); }
};

const getMyOrders = async (req, res) => {
  try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); } 
  catch (e) { res.status(500).json({ message: "Fetch Error" }); }
};

const getAllOrders = async (req, res) => {
  try { res.json(await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 })); } 
  catch (e) { res.status(500).json({ message: "Fetch Error" }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    let msg = `Your order #${order._id.toString().slice(-6)} is now ${status.toLowerCase()}.`;
    if (status === 'Preparing') msg = `☕️ We're preparing your coffee!`;
    if (status === 'Ready') msg = `✅ Your order is ready!`;

    await Notification.create({ user: order.user, title: `Order: ${status}`, message: msg, type: 'Order' }).catch(console.error);
    res.json(order);
  } catch (e) { res.status(500).json({ message: "Update Failed", error: e.message }); }
};

const deleteOrder = async (req, res) => {
  try {
    if (await Order.findByIdAndDelete(req.params.id)) res.json({ message: "Deleted" });
    else res.status(404).json({ message: "Not found" });
  } catch (e) { res.status(500).json({ message: "Delete Error" }); }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder };