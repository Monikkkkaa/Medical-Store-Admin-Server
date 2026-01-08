const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('./src/models/Admin.model');
const User = require('./src/models/User.model');
const Medicine = require('./src/models/Medicine.model');
const Order = require('./src/models/Order.model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Dummy data
const seedData = async () => {
  try {
    // Clear existing data
    await Admin.deleteMany({});
    await User.deleteMany({});
    await Medicine.deleteMany({});
    await Order.deleteMany({});

    console.log('Existing data cleared');

    // Create Admins
    const hashedAdminPassword1 = await bcrypt.hash('admin123', 12);
    const admin1 = new Admin({
      email: 'admin@medicalstore.com',
      password: hashedAdminPassword1,
      role: 'admin',
    });
    await admin1.save();

    const hashedAdminPassword2 = await bcrypt.hash('cool@1234', 12);
    const admin2 = new Admin({
      email: 'cooladmin@gmail.com',
      password: hashedAdminPassword2,
      role: 'admin',
    });
    await admin2.save();
    console.log('Admins created');

    // Create Users
    // const users = [
    //   {
    //     name: 'John Doe',
    //     email: 'john@example.com',
    //     phone: '+1234567890',
    //     password: await bcrypt.hash('password123', 12),
    //     address: {
    //       street: '123 Main St',
    //       city: 'New York',
    //       state: 'NY',
    //       zipCode: '10001',
    //     },
    //   },
    //   {
    //     name: 'Jane Smith',
    //     email: 'jane@example.com',
    //     phone: '+1234567891',
    //     password: await bcrypt.hash('password123', 12),
    //     address: {
    //       street: '456 Oak Ave',
    //       city: 'Los Angeles',
    //       state: 'CA',
    //       zipCode: '90210',
    //     },
    //   },
    //   {
    //     name: 'Mike Johnson',
    //     email: 'mike@example.com',
    //     phone: '+1234567892',
    //     password: await bcrypt.hash('password123', 12),
    //     address: {
    //       street: '789 Pine Rd',
    //       city: 'Chicago',
    //       state: 'IL',
    //       zipCode: '60601',
    //     },
    //   },
    //   {
    //     name: 'Sarah Wilson',
    //     email: 'sarah@example.com',
    //     phone: '+1234567893',
    //     password: await bcrypt.hash('password123', 12),
    //     address: {
    //       street: '321 Elm St',
    //       city: 'Houston',
    //       state: 'TX',
    //       zipCode: '77001',
    //     },
    //   },
    //   {
    //     name: 'David Brown',
    //     email: 'david@example.com',
    //     phone: '+1234567894',
    //     password: await bcrypt.hash('password123', 12),
    //     address: {
    //       street: '654 Maple Dr',
    //       city: 'Phoenix',
    //       state: 'AZ',
    //       zipCode: '85001',
    //     },
    //   },
    // ];

    // const createdUsers = await User.insertMany(users);
    // console.log('Users created');

    // // Create Medicines
    // const medicines = [
    //   {
    //     name: 'Paracetamol 500mg',
    //     image: 'src/uploads/medicines/paracetamol.jpg',
    //     description: 'Pain reliever and fever reducer. Effective for headaches, muscle aches, and reducing fever.',
    //     manufacturer: 'ABC Pharmaceuticals',
    //     manufacturingDate: new Date('2024-01-01'),
    //     expiryDate: new Date('2026-01-01'),
    //     quantity: 150,
    //     price: 12.99,
    //     reviews: [
    //       {
    //         user: createdUsers[0]._id,
    //         rating: 5,
    //         comment: 'Very effective for headaches. Quick relief!',
    //       },
    //       {
    //         user: createdUsers[1]._id,
    //         rating: 4,
    //         comment: 'Good quality medicine, works well.',
    //       },
    //     ],
    //     averageRating: 4.5,
    //   },
    //   {
    //     name: 'Aspirin 100mg',
    //     image: 'src/uploads/medicines/aspirin.jpg',
    //     description: 'Blood thinner and pain reliever. Helps prevent heart attacks and strokes.',
    //     manufacturer: 'XYZ Pharma',
    //     manufacturingDate: new Date('2024-02-01'),
    //     expiryDate: new Date('2026-02-01'),
    //     quantity: 8,
    //     price: 15.50,
    //     reviews: [
    //       {
    //         user: createdUsers[2]._id,
    //         rating: 4,
    //         comment: 'Doctor recommended this. Working fine.',
    //       },
    //     ],
    //     averageRating: 4.0,
    //     isLowStock: true,
    //   },
    //   {
    //     name: 'Ibuprofen 400mg',
    //     image: 'src/uploads/medicines/ibuprofen.jpg',
    //     description: 'Anti-inflammatory pain reliever. Effective for muscle pain and inflammation.',
    //     manufacturer: 'MediCorp',
    //     manufacturingDate: new Date('2024-01-15'),
    //     expiryDate: new Date('2026-01-15'),
    //     quantity: 200,
    //     price: 18.75,
    //     reviews: [
    //       {
    //         user: createdUsers[3]._id,
    //         rating: 5,
    //         comment: 'Excellent for muscle pain after workouts.',
    //       },
    //       {
    //         user: createdUsers[4]._id,
    //         rating: 4,
    //         comment: 'Fast acting and effective.',
    //       },
    //     ],
    //     averageRating: 4.5,
    //   },
    //   {
    //     name: 'Amoxicillin 250mg',
    //     image: 'src/uploads/medicines/amoxicillin.jpg',
    //     description: 'Antibiotic for bacterial infections. Treats respiratory and urinary tract infections.',
    //     manufacturer: 'HealthPlus',
    //     manufacturingDate: new Date('2024-03-01'),
    //     expiryDate: new Date('2025-03-01'),
    //     quantity: 75,
    //     price: 25.00,
    //     reviews: [
    //       {
    //         user: createdUsers[0]._id,
    //         rating: 5,
    //         comment: 'Cleared my infection quickly.',
    //       },
    //     ],
    //     averageRating: 5.0,
    //   },
    //   {
    //     name: 'Cetirizine 10mg',
    //     image: 'src/uploads/medicines/cetirizine.jpg',
    //     description: 'Antihistamine for allergies. Relieves sneezing, runny nose, and itchy eyes.',
    //     manufacturer: 'AllergyFree Inc',
    //     manufacturingDate: new Date('2024-02-15'),
    //     expiryDate: new Date('2026-02-15'),
    //     quantity: 120,
    //     price: 14.25,
    //     reviews: [
    //       {
    //         user: createdUsers[1]._id,
    //         rating: 4,
    //         comment: 'Great for seasonal allergies.',
    //       },
    //     ],
    //     averageRating: 4.0,
    //   },
    //   {
    //     name: 'Omeprazole 20mg',
    //     image: 'src/uploads/medicines/omeprazole.jpg',
    //     description: 'Proton pump inhibitor for acid reflux and stomach ulcers.',
    //     manufacturer: 'GastroMed',
    //     manufacturingDate: new Date('2024-01-20'),
    //     expiryDate: new Date('2025-01-20'),
    //     quantity: 90,
    //     price: 22.50,
    //     reviews: [],
    //     averageRating: 0,
    //   },
    //   {
    //     name: 'Metformin 500mg',
    //     image: 'src/uploads/medicines/metformin.jpg',
    //     description: 'Diabetes medication to control blood sugar levels.',
    //     manufacturer: 'DiabeteCare',
    //     manufacturingDate: new Date('2024-02-10'),
    //     expiryDate: new Date('2025-02-10'),
    //     quantity: 5,
    //     price: 28.00,
    //     reviews: [
    //       {
    //         user: createdUsers[2]._id,
    //         rating: 5,
    //         comment: 'Helps control my diabetes effectively.',
    //       },
    //     ],
    //     averageRating: 5.0,
    //     isLowStock: true,
    //   },
    //   {
    //     name: 'Lisinopril 10mg',
    //     image: 'src/uploads/medicines/lisinopril.jpg',
    //     description: 'ACE inhibitor for high blood pressure and heart conditions.',
    //     manufacturer: 'CardioHealth',
    //     manufacturingDate: new Date('2024-01-05'),
    //     expiryDate: new Date('2025-01-05'),
    //     quantity: 110,
    //     price: 32.75,
    //     reviews: [
    //       {
    //         user: createdUsers[3]._id,
    //         rating: 4,
    //         comment: 'Keeps my blood pressure stable.',
    //       },
    //     ],
    //     averageRating: 4.0,
    //   },
    //   {
    //     name: 'Vitamin D3 1000IU',
    //     image: 'src/uploads/medicines/vitamind3.jpg',
    //     description: 'Vitamin D supplement for bone health and immune system support.',
    //     manufacturer: 'VitaLife',
    //     manufacturingDate: new Date('2024-03-15'),
    //     expiryDate: new Date('2026-03-15'),
    //     quantity: 180,
    //     price: 16.99,
    //     reviews: [
    //       {
    //         user: createdUsers[4]._id,
    //         rating: 5,
    //         comment: 'Good quality vitamin supplement.',
    //       },
    //       {
    //         user: createdUsers[0]._id,
    //         rating: 4,
    //         comment: 'Easy to take, no side effects.',
    //       },
    //     ],
    //     averageRating: 4.5,
    //   },
    //   {
    //     name: 'Loratadine 10mg',
    //     image: 'src/uploads/medicines/loratadine.jpg',
    //     description: 'Non-drowsy antihistamine for allergies and hay fever.',
    //     manufacturer: 'AllergyRelief Co',
    //     manufacturingDate: new Date('2024-02-20'),
    //     expiryDate: new Date('2026-02-20'),
    //     quantity: 3,
    //     price: 13.50,
    //     reviews: [
    //       {
    //         user: createdUsers[1]._id,
    //         rating: 4,
    //         comment: 'Works well without making me sleepy.',
    //       },
    //     ],
    //     averageRating: 4.0,
    //     isLowStock: true,
    //   },
    // ];

    // const createdMedicines = await Medicine.insertMany(medicines);
    // console.log('Medicines created');

    // // Create Orders
    // const orders = [
    //   {
    //     orderId: 'ORD' + Date.now() + '001',
    //     user: createdUsers[0]._id,
    //     items: [
    //       {
    //         medicine: createdMedicines[0]._id,
    //         name: createdMedicines[0].name,
    //         quantity: 2,
    //         price: createdMedicines[0].price,
    //       },
    //       {
    //         medicine: createdMedicines[2]._id,
    //         name: createdMedicines[2].name,
    //         quantity: 1,
    //         price: createdMedicines[2].price,
    //       },
    //     ],
    //     totalAmount: 44.73,
    //     status: 'Delivered',
    //     bookingDate: new Date('2024-01-15'),
    //     deliveryAddress: {
    //       street: '123 Main St',
    //       city: 'New York',
    //       state: 'NY',
    //       zipCode: '10001',
    //     },
    //   },
    //   {
    //     orderId: 'ORD' + Date.now() + '002',
    //     user: createdUsers[1]._id,
    //     items: [
    //       {
    //         medicine: createdMedicines[1]._id,
    //         name: createdMedicines[1].name,
    //         quantity: 1,
    //         price: createdMedicines[1].price,
    //       },
    //       {
    //         medicine: createdMedicines[4]._id,
    //         name: createdMedicines[4].name,
    //         quantity: 2,
    //         price: createdMedicines[4].price,
    //       },
    //     ],
    //     totalAmount: 44.00,
    //     status: 'Pending',
    //     bookingDate: new Date('2024-01-20'),
    //     deliveryAddress: {
    //       street: '456 Oak Ave',
    //       city: 'Los Angeles',
    //       state: 'CA',
    //       zipCode: '90210',
    //     },
    //   },
    //   {
    //     orderId: 'ORD' + Date.now() + '003',
    //     user: createdUsers[2]._id,
    //     items: [
    //       {
    //         medicine: createdMedicines[3]._id,
    //         name: createdMedicines[3].name,
    //         quantity: 1,
    //         price: createdMedicines[3].price,
    //       },
    //     ],
    //     totalAmount: 25.00,
    //     status: 'Delivered',
    //     bookingDate: new Date('2024-01-18'),
    //     deliveryAddress: {
    //       street: '789 Pine Rd',
    //       city: 'Chicago',
    //       state: 'IL',
    //       zipCode: '60601',
    //     },
    //   },
    //   {
    //     orderId: 'ORD' + Date.now() + '004',
    //     user: createdUsers[3]._id,
    //     items: [
    //       {
    //         medicine: createdMedicines[7]._id,
    //         name: createdMedicines[7].name,
    //         quantity: 1,
    //         price: createdMedicines[7].price,
    //       },
    //       {
    //         medicine: createdMedicines[8]._id,
    //         name: createdMedicines[8].name,
    //         quantity: 2,
    //         price: createdMedicines[8].price,
    //       },
    //     ],
    //     totalAmount: 66.73,
    //     status: 'Pending',
    //     bookingDate: new Date('2024-01-22'),
    //     deliveryAddress: {
    //       street: '321 Elm St',
    //       city: 'Houston',
    //       state: 'TX',
    //       zipCode: '77001',
    //     },
    //   },
    //   {
    //     orderId: 'ORD' + Date.now() + '005',
    //     user: createdUsers[4]._id,
    //     items: [
    //       {
    //         medicine: createdMedicines[8]._id,
    //         name: createdMedicines[8].name,
    //         quantity: 3,
    //         price: createdMedicines[8].price,
    //       },
    //     ],
    //     totalAmount: 50.97,
    //     status: 'Cancelled',
    //     bookingDate: new Date('2024-01-19'),
    //     deliveryAddress: {
    //       street: '654 Maple Dr',
    //       city: 'Phoenix',
    //       state: 'AZ',
    //       zipCode: '85001',
    //     },
    //   },
    // ];

    // await Order.insertMany(orders);
    console.log('Orders created');

    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
    console.log('\nAdmin Login Credentials:');
    console.log('  Email: admin@medicalstore.com | Password: admin123');
    console.log('  Email: cooladmin@gmail.com | Password: cool@1234');
    console.log('\nUser Login (any of these):');
    console.log('  Email: john@example.com | Password: password123');
    console.log('  Email: jane@example.com | Password: password123');
    console.log('  Email: mike@example.com | Password: password123');
    console.log('  Email: sarah@example.com | Password: password123');
    console.log('  Email: david@example.com | Password: password123');
    console.log('\nData Summary:');
    console.log(`  - 2 Admins created`);
    // console.log(`  - ${users.length} Users created`);
    // console.log(`  - ${medicines.length} Medicines created`);
    // console.log(`  - ${orders.length} Orders created`);
    // console.log(`  - ${medicines.filter(m => m.isLowStock).length} Low stock medicines`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();