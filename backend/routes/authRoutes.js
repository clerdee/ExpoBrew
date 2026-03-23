const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController'); 
const upload = require('../config/cloudinary');

router.post('/register', upload.single('profileImage'), registerUser);
router.post('/login', loginUser);

module.exports = router;