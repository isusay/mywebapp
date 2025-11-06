import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

import { securityHeaders, rateLimiter, corsOptions, requestLogger, sanitizeInput } from '@/middleware/security';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

import authRoutes from '@/routes/auth';
import courseRoutes from '@/routes/courses';
import categoryRoutes from '@/routes/categories';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(sanitizeInput);
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Course Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Course Management API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/refresh-token': 'Refresh JWT token',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password with token',
        'GET /api/auth/profile': 'Get user profile (protected)',
        'POST /api/auth/change-password': 'Change password (protected)',
        'POST /api/auth/logout': 'Logout (protected)'
      },
      courses: {
        'GET /api/courses': 'Get all courses (with pagination, search, filters)',
        'GET /api/courses/:id': 'Get course by ID',
        'POST /api/courses': 'Create new course (instructor/admin only)',
        'PUT /api/courses/:id': 'Update course (instructor/admin only)',
        'DELETE /api/courses/:id': 'Delete course (instructor/admin only)',
        'GET /api/courses/instructor/my-courses': 'Get instructor courses',
        'POST /api/courses/:id/publish': 'Publish course (instructor/admin only)',
        'POST /api/courses/:id/archive': 'Archive course (instructor/admin only)'
      },
      categories: {
        'GET /api/categories': 'Get all categories',
        'GET /api/categories/:id': 'Get category by ID with courses',
        'POST /api/categories': 'Create new category (admin only)',
        'PUT /api/categories/:id': 'Update category (admin only)',
        'DELETE /api/categories/:id': 'Delete category (admin only)'
      }
    },
    documentation: '/api/docs'
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Course Management API is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;