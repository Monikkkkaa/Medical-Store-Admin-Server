const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const User = require('../../src/models/User.model');
const Medicine = require('../../src/models/Medicine.model');
const Cart = require('../../src/models/Cart.model');
const { connectDB, closeDB, clearDB } = require('./setup');

describe('Cart Controller', () => {
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

  describe('POST /api/user/cart/add', () => {
    it('should add item to cart', async () => {
      const res = await request(app)
        .post('/api/user/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicineId: medicineId,
          quantity: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.items).toHaveLength(1);
      expect(res.body.cart.items[0].quantity).toBe(2);
      expect(res.body.cart.totalAmount).toBe(51.98);
    });

    it('should update quantity if item already exists', async () => {
      // Add item first time
      await request(app)
        .post('/api/user/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicineId: medicineId,
          quantity: 1
        });

      // Add same item again
      const res = await request(app)
        .post('/api/user/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicineId: medicineId,
          quantity: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.cart.items).toHaveLength(1);
      expect(res.body.cart.items[0].quantity).toBe(3);
    });

    it('should fail with non-existent medicine', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .post('/api/user/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicineId: nonExistentId,
          quantity: 1
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Medicine not found');
    });

    it('should fail with insufficient stock', async () => {
      await Medicine.findByIdAndUpdate(medicineId, { quantity: 5 });

      const res = await request(app)
        .post('/api/user/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicineId: medicineId,
          quantity: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Insufficient stock');
    });

    it('should fail with invalid quantity', async () => {
      const res = await request(app)
        .post('/api/user/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicineId: medicineId,
          quantity: 0
        });

      expect(res.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/user/cart/add')
        .send({
          medicineId: medicineId,
          quantity: 1
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/user/cart', () => {
    beforeEach(async () => {
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

    it('should get user cart', async () => {
      const res = await request(app)
        .get('/api/user/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.items).toHaveLength(1);
      expect(res.body.cart.totalAmount).toBe(51.98);
    });

    it('should return empty cart if none exists', async () => {
      await Cart.findOneAndDelete({ user: userId });

      const res = await request(app)
        .get('/api/user/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.cart.items).toHaveLength(0);
      expect(res.body.cart.totalAmount).toBe(0);
    });
  });

  describe('PUT /api/user/cart/update', () => {
    beforeEach(async () => {
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

    it('should update item quantity', async () => {
      const res = await request(app)
        .put('/api/user/cart/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicineId: medicineId,
          quantity: 5
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.items[0].quantity).toBe(5);
      expect(res.body.cart.totalAmount).toBe(129.95);
    });

    it('should fail with item not in cart', async () => {
      const otherMedicine = await Medicine.create({
        name: 'Other Medicine',
        description: 'Other description',
        manufacturer: 'Other Pharma',
        manufacturingDate: new Date('2024-01-01'),
        expiryDate: new Date('2026-01-01'),
        quantity: 50,
        price: 15.99
      });

      const res = await request(app)
        .put('/api/user/cart/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicineId: otherMedicine._id,
          quantity: 3
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Item not found in cart');
    });

    it('should fail with insufficient stock', async () => {
      await Medicine.findByIdAndUpdate(medicineId, { quantity: 3 });

      const res = await request(app)
        .put('/api/user/cart/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicineId: medicineId,
          quantity: 5
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Insufficient stock');
    });
  });

  describe('DELETE /api/user/cart/remove/:medicineId', () => {
    beforeEach(async () => {
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

    it('should remove item from cart', async () => {
      const res = await request(app)
        .delete(`/api/user/cart/remove/${medicineId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.items).toHaveLength(0);
      expect(res.body.cart.totalAmount).toBe(0);
    });

    it('should fail with item not in cart', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/user/cart/remove/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Item not found in cart');
    });
  });
});