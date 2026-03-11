const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { generateOtpEmail } = require('../utils/emailTemplates');

const tempUsers = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email: email });
    if (userExists) return res.status(400).json({ message: "An account with this email already exists." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    tempUsers.set(email, { name, email, password, otp, expires: Date.now() + 10 * 60 * 1000 });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your ExpoBrew Account',
      html: generateOtpEmail(otp) 
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent to your email!" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// --- STEP 2: VERIFY OTP (AND UPLOAD IMAGE) ---
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const profileImageUrl = req.file ? req.file.path : null;
    const profileImageId = req.file ? req.file.filename : null;

    const tempUser = tempUsers.get(email);
    if (!tempUser) return res.status(400).json({ message: "Session expired or email not found. Please register again." });
    if (tempUser.otp !== otp) return res.status(400).json({ message: "Invalid OTP code." });
    if (Date.now() > tempUser.expires) {
      tempUsers.delete(email);
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempUser.password, salt);

    const newUser = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: hashedPassword, 
      profileImage: profileImageUrl,
      profileImageId: profileImageId 
    });

    tempUsers.delete(email);

    res.status(201).json({ 
      message: "User verified and registered successfully!",
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } 
    );

    res.status(200).json({
      message: "Login successful!",
      token: token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }
    });

  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { registerUser, loginUser, verifyOtp };