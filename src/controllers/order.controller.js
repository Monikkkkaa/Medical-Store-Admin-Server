const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Medicine = require('../models/Medicine.model');
const { paginate, getPaginationData } = require('../utils/pagination');

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { skip, limit: pageLimit } = paginate(page, limit);

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.medicine', 'name')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);
    const pagination = getPaginationData(total, page, limit);

    res.json({
      success: true,
      orders,
      pagination,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('items.medicine', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalOrders = await Order.countDocuments();
    const lowStockMedicines = await Medicine.countDocuments({ isLowStock: true });

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalMedicines,
        totalOrders,
        lowStockMedicines,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardStats,
};