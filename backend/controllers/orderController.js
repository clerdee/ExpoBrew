const Order=require('../models/Order');
const Notification=require('../models/Notification');
const axios = require('axios');

const createOrder=async(req,res)=>{try{const {orderItems,totalPrice,shippingAddress,paymentMethod,promoCode='',discountAmount=0}=req.body;if(!orderItems||orderItems.length===0)return res.status(400).json({message:'No items'});if(!shippingAddress||!paymentMethod)return res.status(400).json({message:'Missing details'});const order=new Order({user:req.user._id,orderItems,shippingAddress,paymentMethod,totalPrice,promoCode,discountAmount});res.status(201).json(await order.save());}catch(e){res.status(500).json({message:'Error'});}};
const getMyOrders=async(req,res)=>{try{res.status(200).json(await Order.find({user:req.user._id}).sort({createdAt:-1}));}catch(e){res.status(500).json({message:'Error'});}};
const getAllOrders=async(req,res)=>{try{res.status(200).json(await Order.find({}).populate('user','id name email phone expoPushToken').sort({createdAt:-1}));}catch(e){res.status(500).json({message:'Error'});}};
const getOrderById=async(req,res)=>{try{const order=await Order.findById(req.params.id);if(!order)return res.status(404).json({message:'Not found'});if(order.user.toString()!==req.user._id.toString()&&!req.user.isAdmin)return res.status(401).json({message:'Not auth'});res.status(200).json(order);}catch(e){res.status(500).json({message:'Error'});}};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id.trim()).populate('user');
    
    if (!order) return res.status(404).json({ message: 'Not found' });
    
    order.status = status;
    const updatedOrder = await order.save();
    
    await Notification.create({ 
      user: order.user._id, 
      title: 'Order Status Update', 
      message: `Your order is now: ${status}`, 
      type: 'Order', 
      relatedId: order._id 
    });

    console.log("---- PUSH NOTIFICATION TEST ----");
    console.log("Customer Name:", order.user.name);
    console.log("Customer Push Token:", order.user.expoPushToken);

    if (order.user && order.user.expoPushToken) {
      try {
        const expoRes = await axios.post('https://exp.host/--/api/v2/push/send', {
          to: order.user.expoPushToken,
          title: 'Order Status Update',
          body: `Your order is now: ${status}`,
          data: { orderId: order._id }
        });
        console.log("EXPO SUCCESS RESPONSE:", expoRes.data);
      } catch (pushErr) {
        console.log("EXPO ERROR:", pushErr.response?.data || pushErr.message);
      }
    } else {
      console.log("FAILED: This user does not have a push token saved in the database.");
    }
    console.log("--------------------------------");

    res.status(200).json(updatedOrder);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error' });
  }
};

const deleteOrder=async(req,res)=>{try{const order=await Order.findByIdAndDelete(req.params.id.trim());if(!order)return res.status(404).json({message:"Not found"});await Notification.deleteMany({relatedId:req.params.id.trim()});res.status(200).json({message:"Deleted"});}catch(e){res.status(500).json({message:"Error"});}};
const cancelOrder=async(req,res)=>{try{const order=await Order.findById(req.params.id);if(!order)return res.status(404).json({message:'Not found'});if(order.user.toString()!==req.user._id.toString())return res.status(401).json({message:'Not auth'});if(order.status!=='Pending')return res.status(400).json({message:'Only pending'});order.status='Cancelled';await order.save();await Notification.create({user:order.user,title:'Order Cancelled',message:`Order #${order._id.toString().slice(-6).toUpperCase()} cancelled.`,type:'Order',relatedId:order._id});res.status(200).json({message:'Cancelled'});}catch(e){res.status(500).json({message:'Error'});}};

module.exports={createOrder,getMyOrders,getAllOrders,getOrderById,updateOrderStatus,deleteOrder,cancelOrder};