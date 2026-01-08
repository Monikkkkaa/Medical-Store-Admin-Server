const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const medicineRoutes = require('./routes/medicine.routes');
const orderRoutes = require('./routes/order.routes');

// User Panel Routes
const userAuthRoutes = require('./routes/userAuth.routes');
const cartRoutes = require('./routes/cart.routes');
const userOrderRoutes = require('./routes/userOrder.routes');
const reviewRoutes = require('./routes/review.routes');
const publicMedicineRoutes = require('./routes/publicMedicine.routes');

const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Admin Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);

// User Panel Routes
app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user/cart', cartRoutes);
app.use('/api/user/orders', userOrderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/public/medicines', publicMedicineRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Medical Store API is running!' });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;