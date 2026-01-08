# Medical Store Admin Panel - Backend

A comprehensive backend API for managing a medical store admin panel built with Node.js, Express.js, and MongoDB.

## Features

- **Authentication**: JWT-based admin authentication
- **User Management**: View, manage, and toggle user status
- **Medicine Management**: Full CRUD operations with image upload
- **Order Management**: View and update order status
- **Dashboard**: Statistics and analytics
- **File Upload**: Local storage with Multer
- **Pagination & Search**: Efficient data handling
- **Validation**: Request validation with express-validator

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express Validator

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Medical-Store-Admin-Panel/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` file and update the values:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/medical-store
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=30d
   ADMIN_EMAIL=admin@medicalstore.com
   ADMIN_PASSWORD=admin123
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile

### User Management
- `GET /api/users` - Get all users (with pagination & search)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/toggle-status` - Enable/Disable user

### Medicine Management
- `GET /api/medicines` - Get all medicines (with pagination & search)
- `GET /api/medicines/:id` - Get medicine by ID
- `POST /api/medicines` - Create new medicine (with image upload)
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Order Management
- `GET /api/orders` - Get all orders (with pagination & filters)
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/dashboard/stats` - Get dashboard statistics

### Health Check
- `GET /api/health` - API health status

## Default Admin Credentials

- **Email**: admin@medicalstore.com
- **Password**: admin123

## Project Structure

```
server/
├── src/
│   ├── config/          # Database & app configuration
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── utils/           # Helper functions
│   ├── uploads/         # File storage
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── .env                # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## API Usage Examples

### Admin Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@medicalstore.com",
  "password": "admin123"
}
```

### Create Medicine
```bash
POST /api/medicines
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Paracetamol",
  "description": "Pain reliever and fever reducer",
  "manufacturer": "ABC Pharma",
  "manufacturingDate": "2024-01-01",
  "expiryDate": "2026-01-01",
  "quantity": 100,
  "price": 25.50,
  "image": <file>
}
```

### Update Order Status
```bash
PATCH /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Delivered"
}
```

## Deployment

The backend is ready for deployment on platforms like:
- Render
- Heroku
- Railway
- DigitalOcean

Make sure to:
1. Set environment variables on your hosting platform
2. Use a cloud MongoDB service (MongoDB Atlas)
3. Configure file upload for production (consider Cloudinary)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.