const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { generateOtpEmail } = require('../utils/emailTemplates');

const tempUsers = new Map();
const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  phone: user.phone || '',
  birthday: user.birthday || '',
  addresses: user.addresses || [],
  isActive: user.isActive !== undefined ? user.isActive : true
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: "An account with this email already exists." });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempUsers.set(email, { name, email, password, otp, expires: Date.now() + 10 * 60 * 1000 });

    await transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject: 'Verify your ExpoBrew Account', html: generateOtpEmail(otp) });
    res.status(200).json({ message: 'OTP sent to your email!' });
  } catch (e) { res.status(500).json({ message: 'Server error during registration.' }); }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const temp = tempUsers.get(email);
    
    if (!temp) return res.status(400).json({ message: "Session expired or email not found. Please register again." });
    if (temp.otp !== otp) return res.status(400).json({ message: "Invalid OTP code." });
    if (Date.now() > temp.expires) { tempUsers.delete(email); return res.status(400).json({ message: "OTP has expired. Please register again." }); }

    const user = await User.create({
      name: temp.name,
      email: temp.email,
      password: await bcrypt.hash(temp.password, await bcrypt.genSalt(10)),
      profileImage: req.file ? req.file.path : null,
      profileImageId: req.file ? req.file.filename : null
    });

    tempUsers.delete(email);
    res.status(201).json({ message: "User verified!", user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ message: "Server error during verification." }); }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Invalid email or password." });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful!', token, user: buildUserPayload(user) });
  } catch (e) { res.status(500).json({ message: 'Server error. Please try again.' }); }
};

module.exports = { registerUser, loginUser, verifyOtp, buildUserPayload };