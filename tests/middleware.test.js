const jwt = require('jsonwebtoken');
const { protect } = require('../../src/middlewares/auth.middleware');
const { protectUser } = require('../../src/middlewares/userAuth.middleware');
const { adminOnly } = require('../../src/middlewares/admin.middleware');
const Admin = require('../../src/models/Admin.model');
const User = require('../../src/models/User.model');
const { connectDB, closeDB, clearDB } = require('./setup');

describe('Middleware Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('Auth Middleware', () => {
    let admin;
    let validToken;

    beforeEach(async () => {
      admin = await Admin.create({
        email: 'admin@test.com',
        password: 'hashedpassword'
      });

      validToken = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
      );
    });

    it('should authenticate with valid token', async () => {
      const req = {
        headers: {
          authorization: `Bearer ${validToken}`
        }
      };
      const res = {};
      const next = jest.fn();

      await protect(req, res, next);

      expect(req.admin).toBeDefined();
      expect(req.admin._id.toString()).toBe(admin._id.toString());
      expect(next).toHaveBeenCalled();
    });

    it('should fail without token', async () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied. No token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with invalid token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalidtoken'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '-1h' }
      );

      const req = {
        headers: {
          authorization: `Bearer ${expiredToken}`
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('User Auth Middleware', () => {
    let user;
    let validToken;

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: 'user@test.com',
        phone: '+1234567890',
        password: 'hashedpassword'
      });

      validToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'testsecret',
        { expiresIn: '1h' }
      );
    });

    it('should authenticate user with valid token', async () => {
      const req = {
        headers: {
          authorization: `Bearer ${validToken}`
        }
      };
      const res = {};
      const next = jest.fn();

      await protectUser(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(user._id.toString());
      expect(next).toHaveBeenCalled();
    });

    it('should fail without token', async () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await protectUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied. No token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Admin Only Middleware', () => {
    it('should allow admin access', () => {
      const req = {
        admin: { role: 'admin' }
      };
      const res = {};
      const next = jest.fn();

      adminOnly(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny non-admin access', () => {
      const req = {
        admin: { role: 'user' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      adminOnly(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied. Admin only'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow access when no role specified (default admin)', () => {
      const req = {
        admin: {}
      };
      const res = {};
      const next = jest.fn();

      adminOnly(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});