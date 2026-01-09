const Admin = require('../models/Admin.model');
const generateToken = require('../utils/generateToken');
const { logSuccess, logError } = require('../utils/logger');

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      logError('Admin login failed - Invalid credentials', null, {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id);
    
    logSuccess('Admin login successful', {
      adminId: admin._id,
      email: admin.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
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
    logError('Admin login error', error, {
      email: req.body.email,
      ip: req.ip
    });
    res.status(500).json({ message: error.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    logSuccess('Admin profile accessed', {
      adminId: req.admin._id,
      email: req.admin.email,
      ip: req.ip
    });
    
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (error) {
    logError('Admin profile access error', error, {
      adminId: req.admin?._id,
      ip: req.ip
    });
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginAdmin, getAdminProfile };