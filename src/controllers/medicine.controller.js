const Medicine = require('../models/Medicine.model');
const { paginate, getPaginationData } = require('../utils/pagination');
const { createSearchQuery } = require('../utils/search');

const getAllMedicines = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, lowStock } = req.query;
    const { skip, limit: pageLimit } = paginate(page, limit);

    let query = {};
    if (search) {
      query = createSearchQuery(search, ['name', 'manufacturer']);
    }
    if (lowStock === 'true') {
      query.quantity = { $lt: 10 };
    }

    const medicines = await Medicine.find(query)
      .skip(skip)
      .limit(pageLimit)
      .sort({ quantity: 1, createdAt: -1 });

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

const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('reviews.user', 'name');
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMedicine = async (req, res) => {
  try {
    const medicineData = {
      ...req.body,
      image: req.file ? req.file.path : null,
    };

    const medicine = new Medicine(medicineData);
    await medicine.save();

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      medicine,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      medicine,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({
      success: true,
      message: 'Medicine deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};