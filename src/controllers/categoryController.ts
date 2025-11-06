import { Request, Response } from 'express';
import { CategoryService } from '@/services/categoryService';
import { ApiResponse } from '@/types';

export class CategoryController {
  static async getAllCategories(req: Request, res: Response<ApiResponse>) {
    try {
      const result = await CategoryService.getAllCategories();

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCategoryById(req: Request, res: Response<ApiResponse>) {
    try {
      const categoryId = req.params.id;

      const result = await CategoryService.getCategoryById(categoryId);

      res.status(200).json({
        success: true,
        message: 'Category retrieved successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Category not found' ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to retrieve category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createCategory(req: Request, res: Response<ApiResponse>) {
    try {
      const userRole = (req as any).user?.role;

      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can create categories',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const { name, description, color } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required',
          error: 'MISSING_NAME'
        });
      }

      const result = await CategoryService.createCategory({ name, description, color });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to create category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateCategory(req: Request, res: Response<ApiResponse>) {
    try {
      const userRole = (req as any).user?.role;

      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can update categories',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const categoryId = req.params.id;
      const { name, description, color } = req.body;

      const result = await CategoryService.updateCategory(categoryId, { name, description, color });

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Category not found' ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to update category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteCategory(req: Request, res: Response<ApiResponse>) {
    try {
      const userRole = (req as any).user?.role;

      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can delete categories',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const categoryId = req.params.id;

      const result = await CategoryService.deleteCategory(categoryId);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error instanceof Error ?
        (error.message === 'Category not found' ? 404 :
         error.message.includes('Cannot delete') ? 400 : 500) : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to delete category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}