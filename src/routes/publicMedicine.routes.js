const express = require('express');
const Medicine = require('../models/Medicine.model');
const { paginate, getPaginationData } = require('../utils/pagination');
const { createSearchQuery } = require('../utils/search');

const router = express.Router();

const getPublicMedicines = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category } = req.query;
    const { skip, limit: pageLimit } = paginate(page, limit);

    let query = { quantity: { $gt: 0 } }; // Only show in-stock medicines
    
    if (search) {
      const searchQuery = createSearchQuery(search, ['name', 'manufacturer', 'description']);
      query = { ...query, ...searchQuery };
    }

    const medicines = await Medicine.find(query)
      .select('name image description manufacturer price averageRating reviews quantity')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    const total = await Medicine.countDocuments(query);
    const pagination = getPaginationData(total, page, limit);

    res.json({
      success: true,
      medicines,
      pagination,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('reviews.user', 'name')
      .select('-__v');

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get('/', getPublicMedicines);
router.get('/:id', getPublicMedicineById);

module.exports = router;