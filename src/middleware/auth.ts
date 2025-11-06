import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload } from '@/types';
import { UserRole } from '@prisma/client';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      error: 'MISSING_TOKEN'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      });
    }

    const payload = decoded as JWTPayload;
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

    next();
  });
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

export const adminOnly = authorize([UserRole.ADMIN]);
export const instructorOrAdmin = authorize([UserRole.INSTRUCTOR, UserRole.ADMIN]);
export const allRoles = authorize([UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT]);