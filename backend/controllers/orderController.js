const Order = require('../models/Order');
const Notification = require('../models/Notification'); 

const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice } = req.body;
    if (orderItems && orderItems.length === 0) return res.status(400).json({ message: "No order items" });
    const order = new Order({ user: req.user._id, orderItems, totalPrice });
    res.status(201).json(await order.save());
  } catch (e) { res.status(500).json({ message: "Server Error: Could not create order." }); }
};

const getMyOrders = async (req, res) => {
  try { res.status(200).json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); } 
  catch (e) { res.status(500).json({ message: "Server Error: Could not fetch orders." }); }
};

const getAllOrders = async (req, res) => {
  try { res.status(200).json(await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 })); } 
  catch (e) { res.status(500).json({ message: "Server Error: Could not fetch all orders." }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status; 
    const updatedOrder = await order.save();
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (e) { res.status(500).json({ message: "Server Error: Could not delete order." }); }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder };