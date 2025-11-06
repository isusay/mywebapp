import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EmailService {
  private static transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendPasswordResetEmail(email: string) {
    try {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save reset token to database
      await prisma.passwordReset.create({
        data: {
          email,
          token: resetToken,
          expiresAt
        }
      });

      // Create reset URL (in a real app, this would be your frontend URL)
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

      // Send email
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Password Reset Request - Course Management System',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You requested to reset your password for the Course Management System.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p><strong>Note:</strong> This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              This is an automated message from the Course Management System. Please do not reply to this email.
            </p>
          </div>
        `,
      });

      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      // Find valid reset token
      const resetRequest = await prisma.passwordReset.findFirst({
        where: {
          token,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!resetRequest) {
        throw new Error('Invalid or expired reset token');
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: resetRequest.email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Hash new password
      const bcrypt = require('bcryptjs');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      // Delete the reset token
      await prisma.passwordReset.delete({
        where: { id: resetRequest.id }
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
}