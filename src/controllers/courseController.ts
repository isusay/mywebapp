import { Request, Response } from 'express';
import { CourseService } from '@/services/courseService';
import { ApiResponse } from '@/types';

export class CourseController {
  static async createCourse(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only instructors and admins can create courses',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const courseData = {
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        duration: parseInt(req.body.duration),
        price: parseFloat(req.body.price) || 0,
        maxStudents: parseInt(req.body.maxStudents) || 50,
        thumbnail: req.body.thumbnail,
        categoryIds: req.body.categoryIds,
      };

      const result = await CourseService.createCourse(courseData, userId);

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to create course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAllCourses(req: Request, res: Response<ApiResponse>) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;

      const result = await CourseService.getAllCourses(page, limit, search, categoryId);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCourseById(req: Request, res: Response<ApiResponse>) {
    try {
      const courseId = req.params.id;

      const result = await CourseService.getCourseById(courseId);

      res.status(200).json({
        success: true,
        message: 'Course retrieved successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Course not found' ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to retrieve course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateCourse(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const courseId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const courseData: any = {};
      if (req.body.title) courseData.title = req.body.title;
      if (req.body.description) courseData.description = req.body.description;
      if (req.body.content !== undefined) courseData.content = req.body.content;
      if (req.body.duration !== undefined) courseData.duration = parseInt(req.body.duration);
      if (req.body.price !== undefined) courseData.price = parseFloat(req.body.price);
      if (req.body.maxStudents !== undefined) courseData.maxStudents = parseInt(req.body.maxStudents);
      if (req.body.thumbnail !== undefined) courseData.thumbnail = req.body.thumbnail;
      if (req.body.status !== undefined) courseData.status = req.body.status;
      if (req.body.categoryIds !== undefined) courseData.categoryIds = req.body.categoryIds;

      const result = await CourseService.updateCourse(courseId, courseData, userId);

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error instanceof Error ?
        (error.message === 'Course not found' ? 404 :
         error.message.includes('not authorized') ? 403 : 400) : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to update course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteCourse(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const courseId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const result = await CourseService.deleteCourse(courseId, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error instanceof Error ?
        (error.message === 'Course not found' ? 404 :
         error.message.includes('not authorized') ? 403 :
         error.message.includes('Cannot delete') ? 400 : 500) : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to delete course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getInstructorCourses(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only instructors and admins can view instructor courses',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CourseService.getInstructorCourses(userId, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve instructor courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async publishCourse(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = (req as any).user?.userId;
      const courseId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const result = await CourseService.updateCourse(courseId, { status: 'PUBLISHED' }, userId);

      res.status(200).json({
        success: true,
        message: 'Course published successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error instanceof Error ?
        (error.message === 'Course not found' ? 404 :
         error.message.includes('not authorized') ? 403 : 400) : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to publish course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async archiveCourse(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = (req as any).user?.userId;
      const courseId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const result = await CourseService.updateCourse(courseId, { status: 'ARCHIVED' }, userId);

      res.status(200).json({
        success: true,
        message: 'Course archived successfully',
        data: result
      });
    } catch (error) {
      const statusCode = error instanceof Error ?
        (error.message === 'Course not found' ? 404 :
         error.message.includes('not authorized') ? 403 : 400) : 500;

      res.status(statusCode).json({
        success: false,
        message: 'Failed to archive course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}