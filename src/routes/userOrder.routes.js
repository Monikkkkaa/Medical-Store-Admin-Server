const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getUserOrders,
  getOrderById,
} = require('../controllers/userOrder.controller');
const { protectUser } = require('../middlewares/userAuth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(protectUser);

router.post('/', [
  body('deliveryAddress.street').notEmpty().withMessage('Street address is required'),
  body('deliveryAddress.city').notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').notEmpty().withMessage('State is required'),
  body('deliveryAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  validate,
], createOrder);

router.get('/', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router;