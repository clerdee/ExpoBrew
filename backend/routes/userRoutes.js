const express=require('express');
const router=express.Router();
const upload=require('../config/cloudinary');
const {getAllUsers,deleteUser,getMyProfile,updateUserProfile,toggleFavorite,getFavorites,getMyNotifications,markAllNotificationsRead,savePushToken,removePushToken}=require('../controllers/userController');
const {protect,admin}=require('../middleware/authMiddleware');

router.get('/',protect,admin,getAllUsers);
router.get('/profile',protect,getMyProfile);
router.put('/profile',protect,upload.single('profileImage'),updateUserProfile);
router.get('/favorites',protect,getFavorites);
router.post('/favorites/:productId',protect,toggleFavorite);
router.get('/notifications',protect,getMyNotifications);
router.put('/notifications/read-all',protect,markAllNotificationsRead);
router.post('/push-token',protect,savePushToken);
router.delete('/push-token',protect,removePushToken);
router.delete('/:id',protect,admin,deleteUser);

module.exports=router;
