const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const buildUserPayload = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  phone: user.phone || '',
  birthday: user.birthday || '',
  addresses: user.addresses || [],
  isActive: user.isActive !== undefined ? user.isActive : true,
});

const createPersistedUser = async ({ name, email, password, profileImage = null, profileImageId = null }) => {
  const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
  return User.create({
    name: name.trim(),
    email: normalizeEmail(email),
    password: hashedPassword,
    profileImage,
    profileImageId,
  });
};

const registerUser = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const user = await createPersistedUser({
      name,
      email,
      password,
      profileImage: req.file ? req.file.path : null,
      profileImageId: req.file ? req.file.filename : null,
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: 'Server error during registration.',
      detail: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  return res.status(410).json({
    message: 'OTP registration is no longer used. Please register directly from the app.',
  });
};

const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact an admin.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Server error. Please try again.',
      detail: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, verifyOtp, buildUserPayload };
