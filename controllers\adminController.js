const User = require('../models/User');

exports.addUser = async (req, res) => {
  try {
    const { block, flatNo, userName, contactNo, userType, name } = req.body;

    // Check if any required field is missing
    if (!block || !flatNo || !userName || !contactNo || !userType || !name) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingUser = await User.findOne({ block, flatNo });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists for this flat'
      });
    }

    const user = new User({
      block,
      flatNo,
      userName,
      name,
      contactNo,
      userType,
      isPreRegistered: true
    });

    const savedUser = await user.save();
    return res.status(201).json({
      success: true,
      data: savedUser
    });
  } catch (error) {
    console.error('Add User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};