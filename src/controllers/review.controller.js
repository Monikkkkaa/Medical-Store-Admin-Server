const Medicine = require('../models/Medicine.model');
const Order = require('../models/Order.model');

const addReview = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { rating, comment } = req.body;

    // Check if user has purchased this medicine
    const userOrder = await Order.findOne({
      user: req.user._id,
      'items.medicine': medicineId,
      status: 'Delivered',
    });

    if (!userOrder) {
      return res.status(400).json({ 
        message: 'You can only review medicines you have purchased and received' 
      });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Check if user already reviewed
    const existingReview = medicine.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this medicine' });
    }

    // Add review
    medicine.reviews.push({
      user: req.user._id,
      rating,
      comment,
    });

    // Calculate average rating
    const totalRating = medicine.reviews.reduce((sum, review) => sum + review.rating, 0);
    medicine.averageRating = totalRating / medicine.reviews.length;

    await medicine.save();
    await medicine.populate('reviews.user', 'name');

    res.json({
      success: true,
      message: 'Review added successfully',
      medicine,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMedicineReviews = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const medicine = await Medicine.findById(medicineId)
      .populate({
        path: 'reviews.user',
        select: 'name',
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit),
        },
      });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({
      success: true,
      reviews: medicine.reviews,
      averageRating: medicine.averageRating,
      totalReviews: medicine.reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addReview,
  getMedicineReviews,
};