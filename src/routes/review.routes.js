const express = require('express');
const { body } = require('express-validator');
const {
  addReview,
  getMedicineReviews,
} = require('../controllers/review.controller');
const { protectUser } = require('../middlewares/userAuth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.get('/medicine/:medicineId', getMedicineReviews);

router.post('/medicine/:medicineId', protectUser, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
  validate,
], addReview);

module.exports = router;