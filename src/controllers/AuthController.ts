import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { jwtConfig } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email, isActive: true }
      });

      if (!user || !(await user.checkPassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          clientId: user.clientId 
        },
        jwtConfig.secret as string,
        { expiresIn: jwtConfig.expiresIn } as SignOptions
      );

      await user.updateLastLogin();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            clientId: user.clientId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            role: user.roleId
          }
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


  async logout(req: AuthRequest, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      
      res.json({
        success: true,
        data: {
          id: user.id,
          clientId: user.clientId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone,
          role: user.roleId,
          lastLoginAt: user.lastLoginAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user data'
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const { firstName, lastName, phone } = req.body;

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone || user.phone
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Profile update failed'
      });
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const { currentPassword, newPassword } = req.body;

      if (!(await user.checkPassword(currentPassword))) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      await user.update({ password: newPassword });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Password change failed'
      });
    }
  }
}