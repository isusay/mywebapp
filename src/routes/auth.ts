import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import {
  validateRegistration,
  validateLogin,
  handleValidationErrors
} from '@/middleware/validation';
import { authRateLimiter } from '@/middleware/security';

const router = Router();

// Public routes
router.post(
  '/register',
  authRateLimiter,
  validateRegistration,
  handleValidationErrors,
  AuthController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

router.post(
  '/refresh-token',
  authRateLimiter,
  AuthController.refreshToken
);

router.post(
  '/forgot-password',
  authRateLimiter,
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimiter,
  AuthController.resetPassword
);

// Protected routes
router.get(
  '/profile',
  authenticateToken,
  AuthController.getProfile
);

router.post(
  '/change-password',
  authenticateToken,
  AuthController.changePassword
);

router.post(
  '/logout',
  authenticateToken,
  AuthController.logout
);

export default router;