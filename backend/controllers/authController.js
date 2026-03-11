const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword, 
    });

    res.status(201).json({ 
      message: "User registered successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { registerUser };