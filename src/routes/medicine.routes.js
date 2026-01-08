const express = require('express');
const { body } = require('express-validator');
const {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicine.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/admin.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

const medicineValidation = [
  body('name').notEmpty().withMessage('Medicine name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('manufacturingDate').isISO8601().withMessage('Valid manufacturing date is required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

router.use(protect, adminOnly);

router.get('/', getAllMedicines);
router.get('/:id', getMedicineById);
router.post('/', upload.single('image'), medicineValidation, validate, createMedicine);
router.put('/:id', upload.single('image'), medicineValidation, validate, updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;