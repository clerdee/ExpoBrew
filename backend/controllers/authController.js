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
    pass: process.env.EMAIL_PASS,
  },
});

const isEmailOtpConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

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

    if (!isEmailOtpConfigured()) {
      const user = await createPersistedUser({ name, email, password });
      return res.status(201).json({
        message: 'Account created successfully. Email OTP is not configured on the server.',
        requiresOtp: false,
        userCreated: true,
        user: buildUserPayload(user),
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempUsers.set(email, {
      name,
      email,
      password,
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your ExpoBrew Account',
      html: generateOtpEmail(otp),
    });

    return res.status(200).json({
      message: 'OTP sent to your email!',
      requiresOtp: true,
      userCreated: false,
    });
  } catch (error) {
    console.error('Registration error:', error);

    const fallbackAllowed = !isEmailOtpConfigured() || error?.code === 'EAUTH' || error?.code === 'ESOCKET';
    const name = req.body?.name?.trim();
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (fallbackAllowed && name && email && password && !(await User.findOne({ email }))) {
      try {
        const user = await createPersistedUser({ name, email, password });
        return res.status(201).json({
          message: 'Account created successfully. Email delivery is unavailable right now, so OTP was skipped.',
          requiresOtp: false,
          userCreated: true,
          user: buildUserPayload(user),
        });
      } catch (fallbackError) {
        console.error('Registration fallback error:', fallbackError);
      }
    }

    return res.status(500).json({
      message: 'Server error during registration.',
      detail: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { otp } = req.body;
    const temp = tempUsers.get(email);

    if (!temp) {
      return res.status(400).json({ message: 'Session expired or email not found. Please register again.' });
    }

    if (temp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    if (Date.now() > temp.expires) {
      tempUsers.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });
    }

    const user = await createPersistedUser({
      name: temp.name,
      email: temp.email,
      password: temp.password,
      profileImage: req.file ? req.file.path : null,
      profileImageId: req.file ? req.file.filename : null,
    });

    tempUsers.delete(email);
    return res.status(201).json({
      message: 'User verified!',
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      message: 'Server error during verification.',
      detail: error.message,
    });
  }
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

const googleLogin = async (req, res) => {
  try {
    const { email, name, googleId, profileImage } = req.body;
    if (!email || !googleId) return res.status(400).json({ message: 'Email and Google ID are required.' });

    let user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      user = await User.create({ name, email: normalizeEmail(email), googleId, profileImage });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.profileImage && profileImage) user.profileImage = profileImage;
      await user.save();
    }

    if (user.isActive === false) return res.status(403).json({ message: 'Account deactivated.' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ message: 'Google login successful!', token, user: buildUserPayload(user) });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: 'Server error.', detail: error.message });
  }
};

const facebookLogin = async (req, res) => {
  try {
    const { email, name, facebookId, profileImage } = req.body;
    if (!email || !facebookId) return res.status(400).json({ message: 'Email and Facebook ID are required.' });

    let user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      user = await User.create({ name, email: normalizeEmail(email), facebookId, profileImage });
    } else if (!user.facebookId) {
      user.facebookId = facebookId;
      if (!user.profileImage && profileImage) user.profileImage = profileImage;
      await user.save();
    }

    if (user.isActive === false) return res.status(403).json({ message: 'Account deactivated.' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ message: 'Facebook login successful!', token, user: buildUserPayload(user) });
  } catch (error) {
    console.error('Facebook login error:', error);
    return res.status(500).json({ message: 'Server error.', detail: error.message });
  }
};

module.exports = { registerUser, loginUser, verifyOtp, buildUserPayload, googleLogin, facebookLogin };
