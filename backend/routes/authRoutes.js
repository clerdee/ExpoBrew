const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, googleLogin, facebookLogin } = require('../controllers/authController'); 
const upload = require('../config/cloudinary');

router.post('/register', registerUser);
router.post('/verify-otp', upload.single('profileImage'), verifyOtp);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);

module.exports = router;