const express = require('express');
const { body } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cart.controller');
const { protectUser } = require('../middlewares/userAuth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(protectUser);

router.get('/', getCart);
router.post('/add', [
  body('medicineId').notEmpty().withMessage('Medicine ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate,
], addToCart);

router.put('/update', [
  body('medicineId').notEmpty().withMessage('Medicine ID is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be positive'),
  validate,
], updateCartItem);

router.delete('/remove/:medicineId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;