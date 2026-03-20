const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try { res.status(200).json(await User.find({}).select('-password')); } 
  catch (e) { res.status(500).json({ message: "Server Error: Could not fetch users." }); }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    
    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (e) { res.status(500).json({ message: "Server Error: Could not delete user." }); }
};

module.exports = { getAllUsers, deleteUser };