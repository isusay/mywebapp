import { Request } from 'express';

// Type definitions for Prisma models
export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  content?: string;
  duration: number;
  price: number;
  maxStudents: number;
  currentEnrollment: number;
  status: string;
  thumbnail?: string;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progress: number;
  enrolledAt: Date;
  completedAt?: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  avatar?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export interface CourseCreateInput {
  title: string;
  description: string;
  content?: string;
  duration: number;
  price?: number;
  maxStudents?: number;
  thumbnail?: string;
  categoryIds?: string[];
}

export interface CourseUpdateInput {
  title?: string;
  description?: string;
  content?: string;
  duration?: number;
  price?: number;
  maxStudents?: number;
  thumbnail?: string;
  status?: string;
  categoryIds?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  content?: string;
  duration: number;
  price: number;
  maxStudents: number;
  currentEnrollment: number;
  status: string;
  thumbnail?: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  categories: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentResponse {
  id: string;
  status: string;
  progress: number;
  enrolledAt: Date;
  completedAt?: Date;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    duration: number;
    instructor: {
      firstName: string;
      lastName: string;
    };
  };
}