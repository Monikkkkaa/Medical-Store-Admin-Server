const express = require('express');
const { body } = require('express-validator');
const { loginAdmin, getAdminProfile } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
], loginAdmin);

router.get('/profile', protect, getAdminProfile);

module.exports = router;