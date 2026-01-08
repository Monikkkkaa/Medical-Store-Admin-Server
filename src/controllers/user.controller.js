const User = require('../models/User.model');
const { paginate, getPaginationData } = require('../utils/pagination');
const { createSearchQuery } = require('../utils/search');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const { skip, limit: pageLimit } = paginate(page, limit);

    const searchQuery = createSearchQuery(search, ['name', 'email']);
    
    const users = await User.find(searchQuery)
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(searchQuery);
    const pagination = getPaginationData(total, page, limit);

    res.json({
      success: true,
      users,
      pagination,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, toggleUserStatus };