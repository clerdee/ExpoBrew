const Order = require('../models/Order');
const Notification = require('../models/Notification');

const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice, shippingAddress, paymentMethod, promoCode = '', discountAmount = 0 } = req.body;
    if (!orderItems || orderItems.length === 0) return res.status(400).json({ message: 'No order items' });
    if (!shippingAddress || !paymentMethod) return res.status(400).json({ message: 'Shipping address and payment method required.' });

    const order = new Order({ user: req.user._id, orderItems, shippingAddress, paymentMethod, totalPrice, promoCode, discountAmount });
    res.status(201).json(await order.save());
  } catch (e) { res.status(500).json({ message: 'Server Error: Could not create order.' }); }
};

const getMyOrders = async (req, res) => {
  try { res.status(200).json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'Server Error: Could not fetch orders.' }); }
};

const getAllOrders = async (req, res) => {
  try { res.status(200).json(await Order.find({}).populate('user', 'id name email phone').sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: 'Server Error: Could not fetch all orders.' }); }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to view this order' });
    }
    
    res.status(200).json(order);
  } catch (e) {
    console.log("Get Order By Id Error:", e);
    res.status(500).json({ message: 'Server Error: Could not fetch order.' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id.trim(); 
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found in Database' });

    order.status = status;
    const updatedOrder = await order.save();

    await Notification.create({
      user: order.user, title: 'Order Status Update', message: `Your order is now: ${status}`, type: 'Order', relatedId: order._id
    });

    res.status(200).json(updatedOrder);
  } catch (error) { 
    console.log("Update Status Error:", error);
    res.status(500).json({ message: 'Failed to update order status' }); 
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id.trim();
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await Notification.deleteMany({ relatedId: orderId }); 
    
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (e) { 
    console.log("Delete Order Error:", e);
    res.status(500).json({ message: "Server Error: Could not delete order." }); 
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, getOrderById, updateOrderStatus, deleteOrder };