const express = require('express');
const { body } = require('express-validator');
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/admin.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', getAllOrders);
router.get('/dashboard/stats', getDashboardStats);
router.get('/:id', getOrderById);
router.patch('/:id/status', [
  body('status').isIn(['Pending', 'Delivered', 'Cancelled']).withMessage('Invalid status'),
  validate,
], updateOrderStatus);

module.exports = router;