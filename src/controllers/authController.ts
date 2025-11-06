import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { EmailService } from '@/services/emailService';
import { ApiResponse } from '@/types';

export class AuthController {
  static async register(req: Request, res: Response<ApiResponse>) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        role
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async login(req: Request, res: Response<ApiResponse>) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Invalid credentials'
      });
    }
  }

  static async refreshToken(req: Request, res: Response<ApiResponse>) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          error: 'MISSING_REFRESH_TOKEN'
        });
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        error: error instanceof Error ? error.message : 'Invalid refresh token'
      });
    }
  }

  static async changePassword(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Password change failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async forgotPassword(req: Request, res: Response<ApiResponse>) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
          error: 'MISSING_EMAIL'
        });
      }

      const result = await EmailService.sendPasswordResetEmail(email);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async resetPassword(req: Request, res: Response<ApiResponse>) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required',
          error: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const result = await EmailService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Password reset failed',
        error: error instanceof Error ? error.message : 'Invalid token'
      });
    }
  }

  static async getProfile(req: Request, res: Response<ApiResponse>) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED'
        });
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          bio: true,
          phone: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async logout(req: Request, res: Response<ApiResponse>) {
    // In a stateless JWT implementation, logout is typically handled on the client side
    // by simply removing the tokens from storage. However, we can provide a response
    // to confirm the logout action.

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: { message: 'Please remove tokens from client storage' }
    });
  }
}