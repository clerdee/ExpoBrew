const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp } = require('../controllers/authController');
const upload = require('../config/cloudinary');

router.post('/register', upload.single('profileImage'), registerUser);
router.post('/verify-otp', upload.single('profileImage'), verifyOtp);
router.post('/login', loginUser);

module.exports = router;
