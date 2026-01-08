const express = require('express');
const { getAllUsers, getUserById, toggleUserStatus } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/admin.middleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router;