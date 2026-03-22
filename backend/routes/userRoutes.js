const express=require('express');
const router=express.Router();
const upload=require('../config/cloudinary');
const {getAllUsers,deleteUser,updateUserProfile,toggleFavorite,getFavorites,getMyNotifications,markAllNotificationsRead,savePushToken}=require('../controllers/userController');
const {protect,admin}=require('../middleware/authMiddleware');

router.get('/',protect,admin,getAllUsers);
router.put('/profile',protect,upload.single('profileImage'),updateUserProfile);
router.delete('/:id',protect,admin,deleteUser);
router.get('/favorites',protect,getFavorites);
router.post('/favorites/:productId',protect,toggleFavorite);
router.get('/notifications',protect,getMyNotifications);
router.put('/notifications/read-all',protect,markAllNotificationsRead);
router.post('/push-token',protect,savePushToken);

module.exports=router;