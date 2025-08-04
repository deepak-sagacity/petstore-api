# PetStore API

A comprehensive RESTful API for managing pets and their images built with Node.js, TypeScript, PostgreSQL, and Redis caching.

## 🚀 Features

- **Pet CRUD Operations**: Create, read, update, and delete pets with full data validation
- **Image Upload**: Upload and associate multiple images per pet (max 5 images, 5MB each)
- **JWT Authentication**: Secure user authentication with role-based access control
- **Pagination & Filtering**: Advanced filtering by type, age range, breed with pagination
- **Redis Caching**: High-performance caching for GET endpoints with TTL
- **Input Validation**: Comprehensive request validation using class-validator
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Rate Limiting**: Protection against API abuse (100 requests/15 minutes)
- **Unit Testing**: Comprehensive test coverage with Jest and Supertest

## 🛠️ Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis with TTL support
- **Authentication**: JWT tokens + API key for admin
- **File Upload**: Multer with image validation
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Docker** (for Redis)
- **Postman** (for API testing)

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd petstore-api

# Install all dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

**Update `.env` file with your credentials:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:deepakdb123@localhost:5432/PetStoredb"
JWT_SECRET=petstore-jwt-secret-key-2025-secure
JWT_EXPIRES_IN=24h
REDIS_URL=redis://localhost:6379
API_KEY=petstore-admin-api-key-2025
UPLOAD_PATH=./uploads
```

### 3. Database Setup with Prisma

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npx prisma db push

# Optional: View database in Prisma Studio
npm run prisma:studio
```

### 4. Start Redis Cache (Required for optimal performance)

**Open a new terminal and run:**
```bash
# Start Redis using Docker
docker run -p 6379:6379 redis

# Keep this terminal running
```

**Alternative Redis options:**
```bash
# Using Docker Compose (recommended)
npm run services:up

# Or start Redis container in background
npm run redis:start
```

### 5. Start the Application

**In your main terminal:**
```bash
# Start development server
npm run dev
```

**You should see:**
```
🚀 Server running on port 3000
📚 API Documentation: http://localhost:3000/api-docs
🏥 Health Check: http://localhost:3000/health
✅ Redis connected successfully
```

## 📮 Using Postman Collection

### Import Collection
1. **Open Postman**
2. **Click Import** → **Upload Files**
3. **Select**: `PetStore_API.postman_collection.json`
4. **Click Import**

### Collection Features
- **Auto-token management**: Login automatically saves JWT token
- **Environment variables**: Base URL, tokens, and IDs auto-populated
- **Sample requests**: Ready-to-use API calls with proper data
- **Error scenarios**: Test validation and authentication failures

## 🔄 Application Usage Workflow

### Step 1: User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Step 2: User Login (Get JWT Token)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response includes JWT token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "...", "role": "USER" }
}
```

### Step 3: Create Pet
```http
POST /api/pets
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Buddy",
  "type": "DOG",
  "age": 3,
  "breed": "Golden Retriever",
  "description": "Friendly and energetic dog"
}
```

### Step 4: Upload Pet Images
```http
POST /api/pets/{petId}/images
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data

# Form data:
# images: [file1.jpg, file2.jpg] (max 5 files, 5MB each)
```

### Step 5: Update Pet Data
```http
PUT /api/pets/{petId}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Buddy Updated",
  "age": 4,
  "description": "Very friendly and well-trained dog"
}
```

### Step 6: Get Pets with Filtering
```http
# Get all user's pets
GET /api/pets
Authorization: Bearer <your-jwt-token>

# With pagination and filters
GET /api/pets?page=1&limit=5&type=DOG&minAge=1&maxAge=5&breed=Golden
Authorization: Bearer <your-jwt-token>
```

## 👥 User Role-Based Access Control

### Regular Users (USER role)
- ✅ **Can see**: Only their own pets
- ✅ **Can create**: New pets under their ownership
- ✅ **Can update/delete**: Only their own pets
- ❌ **Cannot see**: Other users' pets

### Admin Users (ADMIN role)
- ✅ **Can see**: All pets from all users
- ✅ **Can access**: Admin endpoints with API key
- ✅ **Special endpoint**: `GET /api/admin/pets` (requires API key)

### Admin API Usage
```http
GET /api/admin/pets
x-api-key: petstore-admin-api-key-2025

# Admin can see all pets with filters
GET /api/admin/pets?type=CAT&page=1&limit=10
x-api-key: petstore-admin-api-key-2025
```

### Create Admin User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

## 🗄️ Redis Cache System

### How Caching Works

1. **Cache Strategy**: Read-through caching with TTL
2. **TTL (Time To Live)**: 300 seconds (5 minutes)
3. **Cache Keys**:
   - Single pet: `pet:{id}`
   - User pets: `pets:user:{userId}:{query}`
   - All pets: `pets:all:{query}`

### Cache Behavior

**GET Requests (Cache First):**
```
1. Check Redis cache
2. If HIT → Return cached data
3. If MISS → Query database → Cache result → Return data
```

**Write Operations (Cache Invalidation):**
```
1. Create/Update/Delete pet
2. Invalidate related cache keys
3. Next GET request will refresh cache
```

### Monitor Cache Activity

**Console Logs (Automatic):**
```
Cache GET [pet:123]: HIT
Cache SET [pets:user:456:{"page":1,"limit":10}]: TTL 300s
Cache DEL [pet:123]
```

**Debug API Endpoints (Development only):**
```http
# Get all cache keys
GET /api/cache/keys

# Check specific key
GET /api/cache/check/pet:123

# Response:
{
  "key": "pet:123",
  "exists": true,
  "ttl": "245s",
  "data": { "id": "123", "name": "Buddy", ... }
}

# Clear cache key
DELETE /api/cache/clear/pet:123
```

**Performance Benefits:**
- ⚡ **Faster responses**: Cached data served instantly
- 📉 **Reduced DB load**: Fewer database queries
- 🚀 **Better scalability**: Handles more concurrent users

## 📚 API Documentation

**Interactive Documentation:**
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Test coverage
npm run test -- --coverage
```

## 📁 Project Structure

```
petstore-api/
├── src/
│   ├── controllers/         # Request handlers
│   ├── services/           # Business logic with caching
│   ├── repositories/       # Database operations
│   ├── middleware/         # Auth, validation, upload
│   ├── routes/            # API route definitions
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Database, Redis, validation
│   ├── __tests__/         # Unit tests
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── uploads/               # Uploaded images
├── PetStore_API.postman_collection.json
└── README.md
```

## 🔧 Available NPM Scripts

```bash
npm run dev              # Start development server
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
npm test                 # Run tests
npm run services:up      # Start Docker services
npm run services:down    # Stop Docker services
npm run redis:start      # Start Redis container
npm run redis:stop       # Stop Redis container
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open Prisma Studio
```

## 🚨 Troubleshooting

### Common Issues

**Port 3000 already in use:**
- Solution: App runs on port 3000 by default

**Redis connection failed:**
- Solution: Start Redis with `docker run -p 6379:6379 redis`
- App works without Redis but without caching benefits

**Database connection error:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env file
- Run `npx prisma db push` to create tables

**JWT token errors:**
- Ensure JWT_SECRET is set in .env
- Check token format: `Bearer <token>`

## 📄 License

MIT License - feel free to use this project for learning and development purposes.