# Medical Store Server Test Suite

## Overview
Comprehensive test suite covering all server-side functionality including controllers, models, middleware, and edge cases.

## Test Structure

### 1. **Authentication Tests** (`auth.test.js`)
- ✅ Valid login credentials
- ✅ Invalid email/password combinations
- ✅ Missing required fields
- ✅ Invalid email format
- ✅ Token-based authentication
- ✅ Invalid/expired tokens
- ✅ Protected route access

### 2. **Medicine Controller Tests** (`medicine.test.js`)
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Search and filtering functionality
- ✅ Pagination
- ✅ Low stock filtering
- ✅ Input validation
- ✅ File upload handling
- ✅ Authorization checks
- ✅ Error handling for non-existent records

### 3. **User Order Tests** (`userOrder.test.js`)
- ✅ Order creation with valid data
- ✅ Empty cart validation
- ✅ Stock availability checks
- ✅ Address validation
- ✅ Inventory updates after order
- ✅ Cart clearing after order
- ✅ Order retrieval and pagination
- ✅ User-specific order access
- ✅ Authorization checks

### 4. **Cart Controller Tests** (`cart.test.js`)
- ✅ Add items to cart
- ✅ Update item quantities
- ✅ Remove items from cart
- ✅ Stock validation
- ✅ Quantity validation
- ✅ Total amount calculations
- ✅ User-specific cart access
- ✅ Non-existent medicine handling

### 5. **Middleware Tests** (`middleware.test.js`)
- ✅ Admin authentication middleware
- ✅ User authentication middleware
- ✅ Admin-only access control
- ✅ Token validation
- ✅ Error handling for invalid tokens
- ✅ Missing token scenarios

### 6. **Model Tests** (`models.test.js`)
- ✅ Medicine model validation
- ✅ User model validation and password hashing
- ✅ Admin model validation
- ✅ Order model with auto-generated IDs
- ✅ Cart model with calculations
- ✅ Field validation rules
- ✅ Unique constraints
- ✅ Password comparison methods

## Edge Cases Covered

### Security
- Invalid/expired JWT tokens
- Unauthorized access attempts
- SQL injection prevention
- Input sanitization
- Password hashing verification

### Data Validation
- Required field validation
- Email format validation
- Phone number format validation
- Negative values prevention
- Date format validation
- Quantity and price constraints

### Business Logic
- Stock availability checks
- Low stock detection
- Order total calculations
- Cart total calculations
- User-specific data access
- Inventory updates

### Error Handling
- Non-existent resource access
- Database connection errors
- Validation errors
- Authentication failures
- Authorization failures

## Running Tests

### Prerequisites
```bash
cd server/tests
npm install
```

### Run All Tests
```bash
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npx jest auth.test.js
```

## Test Coverage Goals
- **Controllers**: 100% function coverage
- **Models**: 100% validation coverage
- **Middleware**: 100% authentication coverage
- **Edge Cases**: All critical paths tested

## Test Environment
- **Database**: MongoDB Memory Server (isolated testing)
- **Framework**: Jest with Supertest
- **Mocking**: JWT tokens, bcrypt hashing
- **Cleanup**: Automatic database cleanup between tests

## Continuous Integration
Tests are designed to run in CI/CD pipelines with:
- Isolated test database
- No external dependencies
- Deterministic results
- Fast execution time

## Adding New Tests
1. Create test file in `/tests` directory
2. Follow naming convention: `*.test.js`
3. Use setup/teardown from `setup.js`
4. Include positive and negative test cases
5. Test all edge cases and error conditions