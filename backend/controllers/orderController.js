const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { sendExpoPushNotifications } = require('../utils/pushNotifications');

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      totalPrice,
      shippingAddress,
      paymentMethod,
      promoCode = '',
      discountAmount = 0,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items' });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Missing details' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      promoCode,
      discountAmount,
    });

    return res.status(201).json(await order.save());
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    return res.status(200).json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    return res.status(200).json(
      await Order.find({})
        .populate('user', 'id name email phone expoPushToken')
        .sort({ createdAt: -1 })
    );
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not auth' });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Get order by id error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id.trim()).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    await Notification.create({
      user: order.user._id,
      title: 'Order Status Update',
      message: `Your order is now: ${status}`,
      type: 'Order',
      relatedId: order._id,
    });

    const userTokens = [...new Set([...(order.user?.expoPushTokens || []), order.user?.expoPushToken].filter(Boolean))];
    const pushResult = await sendExpoPushNotifications(
      userTokens.map((token) => ({
        to: token,
        title: 'Order Status Update',
        body: `Your order is now: ${status}`,
        data: { type: 'order', orderId: String(order._id) },
      }))
    );

    if (!pushResult.sent) {
      console.log(`Order ${order._id}: no valid Expo push token to notify.`);
    } else if (pushResult.ticketErrors.length || pushResult.receiptErrors.length) {
      console.log('Order push notification issues:', pushResult);
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id.trim());

    if (!order) {
      return res.status(404).json({ message: 'Not found' });
    }

    await Notification.deleteMany({ relatedId: req.params.id.trim() });
    return res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not auth' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending' });
    }

    order.status = 'Cancelled';
    await order.save();
    await Notification.create({
      user: order.user,
      title: 'Order Cancelled',
      message: `Order #${order._id.toString().slice(-6).toUpperCase()} cancelled.`,
      type: 'Order',
      relatedId: order._id,
    });

    return res.status(200).json({ message: 'Cancelled' });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ message: 'Error' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
};
