const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const Admin = require('../../src/models/Admin.model');
const Medicine = require('../../src/models/Medicine.model');
const { connectDB, closeDB, clearDB } = require('./setup');

describe('Medicine Controller', () => {
  let token;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await Admin.create({
      email: 'admin@test.com',
      password: hashedPassword
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'admin123'
      });

    token = loginRes.body.token;
  });

  describe('GET /api/medicines', () => {
    beforeEach(async () => {
      await Medicine.create([
        {
          name: 'Paracetamol',
          description: 'Pain reliever',
          manufacturer: 'ABC Pharma',
          manufacturingDate: new Date('2024-01-01'),
          expiryDate: new Date('2026-01-01'),
          quantity: 100,
          price: 10.99
        },
        {
          name: 'Aspirin',
          description: 'Blood thinner',
          manufacturer: 'XYZ Pharma',
          manufacturingDate: new Date('2024-02-01'),
          expiryDate: new Date('2026-02-01'),
          quantity: 5,
          price: 15.50,
          isLowStock: true
        }
      ]);
    });

    it('should get all medicines', async () => {
      const res = await request(app)
        .get('/api/medicines')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.medicines).toHaveLength(2);
    });

    it('should filter by search term', async () => {
      const res = await request(app)
        .get('/api/medicines?search=Paracetamol')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.medicines).toHaveLength(1);
      expect(res.body.medicines[0].name).toBe('Paracetamol');
    });

    it('should filter by low stock', async () => {
      const res = await request(app)
        .get('/api/medicines?lowStock=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.medicines).toHaveLength(1);
      expect(res.body.medicines[0].isLowStock).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/medicines?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.medicines).toHaveLength(1);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/medicines');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/medicines', () => {
    const validMedicine = {
      name: 'Test Medicine',
      description: 'Test description',
      manufacturer: 'Test Pharma',
      manufacturingDate: '2024-01-01',
      expiryDate: '2026-01-01',
      quantity: 50,
      price: 25.99
    };

    it('should create medicine with valid data', async () => {
      const res = await request(app)
        .post('/api/medicines')
        .set('Authorization', `Bearer ${token}`)
        .send(validMedicine);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.medicine.name).toBe('Test Medicine');
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/medicines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Medicine'
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid price', async () => {
      const res = await request(app)
        .post('/api/medicines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validMedicine,
          price: -10
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid quantity', async () => {
      const res = await request(app)
        .post('/api/medicines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validMedicine,
          quantity: -5
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid date format', async () => {
      const res = await request(app)
        .post('/api/medicines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validMedicine,
          expiryDate: 'invalid-date'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/medicines/:id', () => {
    let medicineId;

    beforeEach(async () => {
      const medicine = await Medicine.create({
        name: 'Original Medicine',
        description: 'Original description',
        manufacturer: 'Original Pharma',
        manufacturingDate: new Date('2024-01-01'),
        expiryDate: new Date('2026-01-01'),
        quantity: 100,
        price: 20.99
      });
      medicineId = medicine._id;
    });

    it('should update medicine with valid data', async () => {
      const res = await request(app)
        .put(`/api/medicines/${medicineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Medicine',
          description: 'Updated description',
          manufacturer: 'Updated Pharma',
          manufacturingDate: '2024-01-01',
          expiryDate: '2026-01-01',
          quantity: 150,
          price: 25.99
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.medicine.name).toBe('Updated Medicine');
    });

    it('should fail with invalid medicine ID', async () => {
      const res = await request(app)
        .put('/api/medicines/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Medicine',
          description: 'Updated description',
          manufacturer: 'Updated Pharma',
          manufacturingDate: '2024-01-01',
          expiryDate: '2026-01-01',
          quantity: 150,
          price: 25.99
        });

      expect(res.status).toBe(500);
    });

    it('should fail with non-existent medicine ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/medicines/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Medicine',
          description: 'Updated description',
          manufacturer: 'Updated Pharma',
          manufacturingDate: '2024-01-01',
          expiryDate: '2026-01-01',
          quantity: 150,
          price: 25.99
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Medicine not found');
    });
  });

  describe('DELETE /api/medicines/:id', () => {
    let medicineId;

    beforeEach(async () => {
      const medicine = await Medicine.create({
        name: 'Medicine to Delete',
        description: 'Description',
        manufacturer: 'Pharma',
        manufacturingDate: new Date('2024-01-01'),
        expiryDate: new Date('2026-01-01'),
        quantity: 100,
        price: 20.99
      });
      medicineId = medicine._id;
    });

    it('should delete medicine successfully', async () => {
      const res = await request(app)
        .delete(`/api/medicines/${medicineId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Medicine deleted successfully');
    });

    it('should fail with non-existent medicine ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/medicines/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Medicine not found');
    });
  });
});