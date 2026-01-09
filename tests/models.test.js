const Medicine = require('../../src/models/Medicine.model');
const User = require('../../src/models/User.model');
const Admin = require('../../src/models/Admin.model');
const Order = require('../../src/models/Order.model');
const Cart = require('../../src/models/Cart.model');
const { connectDB, closeDB, clearDB } = require('./setup');

describe('Model Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('Medicine Model', () => {
    const validMedicine = {
      name: 'Test Medicine',
      description: 'Test description',
      manufacturer: 'Test Pharma',
      manufacturingDate: new Date('2024-01-01'),
      expiryDate: new Date('2026-01-01'),
      quantity: 100,
      price: 25.99
    };

    it('should create medicine with valid data', async () => {
      const medicine = new Medicine(validMedicine);
      const savedMedicine = await medicine.save();

      expect(savedMedicine.name).toBe('Test Medicine');
      expect(savedMedicine.quantity).toBe(100);
      expect(savedMedicine.price).toBe(25.99);
      expect(savedMedicine.isLowStock).toBe(false);
    });

    it('should set isLowStock to true when quantity <= 10', async () => {
      const medicine = new Medicine({
        ...validMedicine,
        quantity: 5
      });
      const savedMedicine = await medicine.save();

      expect(savedMedicine.isLowStock).toBe(true);
    });

    it('should fail without required fields', async () => {
      const medicine = new Medicine({
        name: 'Test Medicine'
      });

      await expect(medicine.save()).rejects.toThrow();
    });

    it('should fail with negative price', async () => {
      const medicine = new Medicine({
        ...validMedicine,
        price: -10
      });

      await expect(medicine.save()).rejects.toThrow();
    });

    it('should fail with negative quantity', async () => {
      const medicine = new Medicine({
        ...validMedicine,
        quantity: -5
      });

      await expect(medicine.save()).rejects.toThrow();
    });

    it('should calculate average rating correctly', async () => {
      const medicine = new Medicine({
        ...validMedicine,
        reviews: [
          { user: '507f1f77bcf86cd799439011', rating: 4, comment: 'Good' },
          { user: '507f1f77bcf86cd799439012', rating: 5, comment: 'Excellent' }
        ]
      });

      medicine.calculateAverageRating();
      expect(medicine.averageRating).toBe(4.5);
    });
  });

  describe('User Model', () => {
    const validUser = {
      name: 'Test User',
      email: 'user@test.com',
      phone: '+1234567890',
      password: 'password123'
    };

    it('should create user with valid data', async () => {
      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser.name).toBe('Test User');
      expect(savedUser.email).toBe('user@test.com');
      expect(savedUser.password).not.toBe('password123'); // Should be hashed
    });

    it('should hash password before saving', async () => {
      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should fail with invalid email', async () => {
      const user = new User({
        ...validUser,
        email: 'invalid-email'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      await User.create(validUser);
      const duplicateUser = new User(validUser);

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should fail with invalid phone format', async () => {
      const user = new User({
        ...validUser,
        phone: '123'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should compare password correctly', async () => {
      const user = new User(validUser);
      const savedUser = await user.save();

      const isMatch = await savedUser.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await savedUser.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Admin Model', () => {
    const validAdmin = {
      email: 'admin@test.com',
      password: 'admin123'
    };

    it('should create admin with valid data', async () => {
      const admin = new Admin(validAdmin);
      const savedAdmin = await admin.save();

      expect(savedAdmin.email).toBe('admin@test.com');
      expect(savedAdmin.role).toBe('admin');
      expect(savedAdmin.password).not.toBe('admin123'); // Should be hashed
    });

    it('should hash password before saving', async () => {
      const admin = new Admin(validAdmin);
      const savedAdmin = await admin.save();

      expect(savedAdmin.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should fail with duplicate email', async () => {
      await Admin.create(validAdmin);
      const duplicateAdmin = new Admin(validAdmin);

      await expect(duplicateAdmin.save()).rejects.toThrow();
    });

    it('should compare password correctly', async () => {
      const admin = new Admin(validAdmin);
      const savedAdmin = await admin.save();

      const isMatch = await savedAdmin.comparePassword('admin123');
      expect(isMatch).toBe(true);

      const isNotMatch = await savedAdmin.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Order Model', () => {
    let userId, medicineId;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'user@test.com',
        phone: '+1234567890',
        password: 'password123'
      });
      userId = user._id;

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

    it('should create order with valid data', async () => {
      const order = new Order({
        user: userId,
        items: [{
          medicine: medicineId,
          name: 'Test Medicine',
          quantity: 2,
          price: 25.99
        }],
        totalAmount: 51.98,
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345'
        }
      });

      const savedOrder = await order.save();
      expect(savedOrder.orderId).toBeDefined();
      expect(savedOrder.orderId).toMatch(/^ORD\d+/);
      expect(savedOrder.status).toBe('Pending');
    });

    it('should generate unique orderId', async () => {
      const order1 = await Order.create({
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

      const order2 = await Order.create({
        user: userId,
        items: [{
          medicine: medicineId,
          name: 'Test Medicine',
          quantity: 1,
          price: 25.99
        }],
        totalAmount: 25.99,
        deliveryAddress: {
          street: '456 Test Ave',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345'
        }
      });

      expect(order1.orderId).not.toBe(order2.orderId);
    });
  });

  describe('Cart Model', () => {
    let userId, medicineId;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'user@test.com',
        phone: '+1234567890',
        password: 'password123'
      });
      userId = user._id;

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

    it('should create cart with valid data', async () => {
      const cart = new Cart({
        user: userId,
        items: [{
          medicine: medicineId,
          quantity: 2,
          price: 25.99
        }],
        totalAmount: 51.98
      });

      const savedCart = await cart.save();
      expect(savedCart.items).toHaveLength(1);
      expect(savedCart.totalAmount).toBe(51.98);
    });

    it('should calculate total amount correctly', async () => {
      const cart = new Cart({
        user: userId,
        items: [
          {
            medicine: medicineId,
            quantity: 2,
            price: 25.99
          }
        ]
      });

      cart.calculateTotal();
      expect(cart.totalAmount).toBe(51.98);
    });

    it('should fail with negative quantity', async () => {
      const cart = new Cart({
        user: userId,
        items: [{
          medicine: medicineId,
          quantity: -1,
          price: 25.99
        }],
        totalAmount: 25.99
      });

      await expect(cart.save()).rejects.toThrow();
    });
  });
});