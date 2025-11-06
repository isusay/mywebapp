# Course Management System

A comprehensive web application for managing courses with role-based access control, built with Node.js, Express, TypeScript, and Prisma.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **User Roles**: Support for Admin, Instructor, and Student roles
- **Course Management**: Full CRUD operations for courses
- **Enrollment System**: Student enrollment and progress tracking
- **Security**: Rate limiting, input validation, and security headers
- **Password Reset**: Email-based password reset functionality
- **API Documentation**: RESTful API with comprehensive error handling

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **Validation**: Express-validator for request validation
- **Email**: Nodemailer for password reset emails

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 13+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd course-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```

   Configure your environment variables in `.env`:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/course_management"

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@coursemanagement.com
   ```

4. **Database setup**
   ```bash
   # Create database
   createdb course_management

   # Generate Prisma client
   npx prisma generate

   # Run migrations (if any)
   npx prisma migrate dev
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - Logout (protected)

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get Profile (with token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Roles

- **ADMIN**: Full system access, can manage all users and courses
- **INSTRUCTOR**: Can create and manage their own courses
- **STUDENT**: Can enroll in courses and view content

## Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **JWT Authentication**: Short-lived access tokens with refresh tokens
- **Rate Limiting**: Configurable rate limits for API endpoints
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet middleware for security headers
- **Input Sanitization**: XSS protection and input sanitization

## Development Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server

# Database
npm run db:generate # Generate Prisma client
npm run db:migrate  # Run database migrations
npm run db:studio   # Open Prisma Studio

# Testing & Quality
npm test            # Run tests
npm test:watch      # Run tests in watch mode
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues
```

## Project Structure

```
src/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.