import { Router } from 'express';
import { CategoryController } from '@/controllers/categoryController';
import { authenticateToken, adminOnly } from '@/middleware/auth';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin routes
router.post(
  '/',
  authenticateToken,
  adminOnly,
  CategoryController.createCategory
);

router.put(
  '/:id',
  authenticateToken,
  adminOnly,
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authenticateToken,
  adminOnly,
  CategoryController.deleteCategory
);

export default router;