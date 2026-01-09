const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const User = require('../../src/models/User.model');
const Medicine = require('../../src/models/Medicine.model');
const Cart = require('../../src/models/Cart.model');
const Order = require('../../src/models/Order.model');
const { connectDB, closeDB, clearDB } = require('./setup');

describe('User Order Controller', () => {
  let userToken;
  let userId;
  let medicineId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    
    // Create user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await User.create({
      name: 'Test User',
      email: 'user@test.com',
      phone: '+1234567890',
      password: hashedPassword
    });
    userId = user._id;

    // Login user
    const loginRes = await request(app)
      .post('/api/user/auth/login')
      .send({
        email: 'user@test.com',
        password: 'password123'
      });
    userToken = loginRes.body.token;

    // Create medicine
    const medicine = await Medicine.create({
      name: 'Test Medicine',
      description: 'Test description',
      manufacturer: 'Test Pharma',
      manufacturingDate: new Date('2024-01-01'),
      expiryDate: new Date('2026-01-01'),
      quantity: 100,
      price: 25.99
    });
    medicineId = medicine._id;
  });

  describe('POST /api/user/orders', () => {
    beforeEach(async () => {
      // Create cart with items
      await Cart.create({
        user: userId,
        items: [{
          medicine: medicineId,
          quantity: 2,
          price: 25.99
        }],
        totalAmount: 51.98
      });
    });

    const validAddress = {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345'
    };

    it('should create order with valid data', async () => {
      const res = await request(app)
        .post('/api/user/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deliveryAddress: validAddress
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order.totalAmount).toBe(51.98);
      expect(res.body.order.deliveryAddress.street).toBe('123 Test St');
    });

    it('should fail with empty cart', async () => {
      await Cart.findOneAndDelete({ user: userId });

      const res = await request(app)
        .post('/api/user/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deliveryAddress: validAddress
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Cart is empty');
    });

    it('should fail with insufficient stock', async () => {
      await Medicine.findByIdAndUpdate(medicineId, { quantity: 1 });

      const res = await request(app)
        .post('/api/user/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deliveryAddress: validAddress
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');
    });

    it('should fail with missing address fields', async () => {
      const res = await request(app)
        .post('/api/user/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deliveryAddress: {
            street: '123 Test St'
          }
        });

      expect(res.status).toBe(400);
    });

    it('should update medicine quantity after order', async () => {
      await request(app)
        .post('/api/user/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deliveryAddress: validAddress
        });

      const medicine = await Medicine.findById(medicineId);
      expect(medicine.quantity).toBe(98); // 100 - 2
    });

    it('should clear cart after order', async () => {
      await request(app)
        .post('/api/user/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          deliveryAddress: validAddress
        });

      const cart = await Cart.findOne({ user: userId });
      expect(cart).toBeNull();
    });
  });

  describe('GET /api/user/orders', () => {
    beforeEach(async () => {
      await Order.create([
        {
          user: userId,
          items: [{
            medicine: medicineId,
            name: 'Test Medicine',
            quantity: 1,
            price: 25.99
          }],
          totalAmount: 25.99,
          deliveryAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345'
          }
        },
        {
          user: userId,
          items: [{
            medicine: medicineId,
            name: 'Test Medicine',
            quantity: 2,
            price: 25.99
          }],
          totalAmount: 51.98,
          deliveryAddress: {
            street: '456 Test Ave',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345'
          }
        }
      ]);
    });

    it('should get user orders', async () => {
      const res = await request(app)
        .get('/api/user/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders).toHaveLength(2);
    });

    it('should paginate orders', async () => {
      const res = await request(app)
        .get('/api/user/orders?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/user/orders');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/user/orders/:id', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        user: userId,
        items: [{
          medicine: medicineId,
          name: 'Test Medicine',
          quantity: 1,
          price: 25.99
        }],
        totalAmount: 25.99,
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345'
        }
      });
      orderId = order._id;
    });

    it('should get specific order', async () => {
      const res = await request(app)
        .get(`/api/user/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.totalAmount).toBe(25.99);
    });

    it('should fail with non-existent order', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/user/orders/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Order not found');
    });

    it('should fail accessing other user order', async () => {
      // Create another user
      const hashedPassword = await bcrypt.hash('password123', 12);
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@test.com',
        phone: '+1234567891',
        password: hashedPassword
      });

      // Create order for other user
      const otherOrder = await Order.create({
        user: otherUser._id,
        items: [{
          medicine: medicineId,
          name: 'Test Medicine',
          quantity: 1,
          price: 25.99
        }],
        totalAmount: 25.99,
        deliveryAddress: {
          street: '789 Other St',
          city: 'Other City',
          state: 'Other State',
          zipCode: '54321'
        }
      });

      const res = await request(app)
        .get(`/api/user/orders/${otherOrder._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Order not found');
    });
  });
});