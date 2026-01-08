const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Medicine = require('../models/Medicine.model');

const createOrder = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.medicine');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock availability
    for (const item of cart.items) {
      if (item.medicine.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.medicine.name}` 
        });
      }
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: cart.items.map(item => ({
        medicine: item.medicine._id,
        name: item.medicine.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: cart.totalAmount,
      deliveryAddress,
    });

    await order.save();

    // Update medicine quantities
    for (const item of cart.items) {
      await Medicine.findByIdAndUpdate(
        item.medicine._id,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });

    await order.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('items.medicine', 'name image')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('items.medicine', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
};