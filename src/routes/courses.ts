import { Router } from 'express';
import { CourseController } from '@/controllers/courseController';
import { authenticateToken, instructorOrAdmin, adminOnly } from '@/middleware/auth';
import {
  validateCourseCreate,
  validateCourseUpdate,
  handleValidationErrors
} from '@/middleware/validation';

const router = Router();

// Public routes
router.get('/', CourseController.getAllCourses);
router.get('/:id', CourseController.getCourseById);

// Protected routes
router.post(
  '/',
  authenticateToken,
  instructorOrAdmin,
  validateCourseCreate,
  handleValidationErrors,
  CourseController.createCourse
);

router.put(
  '/:id',
  authenticateToken,
  instructorOrAdmin,
  validateCourseUpdate,
  handleValidationErrors,
  CourseController.updateCourse
);

router.delete(
  '/:id',
  authenticateToken,
  instructorOrAdmin,
  CourseController.deleteCourse
);

// Instructor/Admin routes
router.get(
  '/instructor/my-courses',
  authenticateToken,
  instructorOrAdmin,
  CourseController.getInstructorCourses
);

// Course status management
router.post(
  '/:id/publish',
  authenticateToken,
  instructorOrAdmin,
  CourseController.publishCourse
);

router.post(
  '/:id/archive',
  authenticateToken,
  instructorOrAdmin,
  CourseController.archiveCourse
);

export default router;