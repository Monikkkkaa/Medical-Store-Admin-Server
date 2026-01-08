const Admin = require('../models/Admin.model');
const generateToken = require('../utils/generateToken');

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id);
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginAdmin, getAdminProfile };