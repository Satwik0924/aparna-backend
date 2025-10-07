import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import Role from '../models/Role';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

// Ensure associations are loaded
import '../models'; // This will load all model associations

export class UserController {
  // Get all users with pagination and filters
  async getUsers(req: AuthRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        status,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = {};

      // Get user's role to check if super admin
      const currentUser = await User.findByPk(req.user?.id, {
        include: [{
          model: Role,
          as: 'role',
          attributes: ['name']
        }]
      });

      const isSuperAdmin = currentUser?.role?.name === 'Super Admin';

      console.log('🔍 Current user:', currentUser?.email, 'Role:', currentUser?.role?.name, 'ClientId:', currentUser?.clientId);
      console.log('🔍 Is Super Admin:', isSuperAdmin);

      // Everyone except Super Admin should only see users from their own client
      if (!isSuperAdmin) {
        where.clientId = currentUser?.clientId;
        console.log('🔍 Applying client filter for clientId:', currentUser?.clientId);
      } else {
        console.log('🔍 Super Admin - showing all users across all clients');
      }

      // Search by name or email
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by role
      if (role) {
        where.roleId = role;
      }

      // Filter by status
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [[sortBy as string, sortOrder as string]],
        attributes: {
          exclude: ['password']
        },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          }
        ]
      });

      console.log('🔍 Users found:', rows.length, 'Total count:', count);

      res.json({
        success: true,
        data: {
          users: rows,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Get single user by ID
  async getUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const where: any = { id };

      // Add client filter if user is not super admin
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const user = await User.findOne({
        where,
        attributes: {
          exclude: ['password']
        },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name', 'permissions']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  // Create new user
  async createUser(req: AuthRequest, res: Response) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        roleId,
        clientId,
        phone,
        isActive = true
      } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Verify role exists
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role ID'
        });
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password, // Will be hashed by the model hook
        roleId,
        clientId: clientId || req.user?.clientId,
        phone,
        isActive
      });

      // Fetch created user with role
      const createdUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: createdUser
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }

  // Update user
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        email,
        roleId,
        phone,
        isActive
      } = req.body;

      const where: any = { id };

      // Add client filter if user is not super admin
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const user = await User.findOne({ where });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is being changed and already exists
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ 
          where: { 
            email,
            id: { [Op.ne]: id }
          } 
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      // Verify role exists if being changed
      if (roleId && roleId !== user.roleId) {
        const role = await Role.findByPk(roleId);
        if (!role) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role ID'
          });
        }
      }

      // Update user
      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        roleId: roleId || user.roleId,
        phone: phone !== undefined ? phone : user.phone,
        isActive: isActive !== undefined ? isActive : user.isActive
      });

      // Fetch updated user with role
      const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          }
        ]
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Update user password
  async updateUserPassword(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      const where: any = { id };

      // Add client filter if user is not super admin
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const user = await User.findOne({ where });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // If updating own password, verify current password
      if (req.user?.id === id) {
        const isValidPassword = await user.checkPassword(currentPassword);
        if (!isValidPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }
      }

      // Update password (will be hashed by the model hook)
      await user.update({ password: newPassword });

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }
  }

  // Delete user (soft delete)
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.user?.id === id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const where: any = { id };

      // Add client filter if user is not super admin
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const user = await User.findOne({ where });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete
      await user.destroy();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  // Toggle user status
  async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Prevent self-deactivation
      if (req.user?.id === id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }

      const where: any = { id };

      // Add client filter if user is not super admin
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const user = await User.findOne({ where });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Toggle status
      await user.update({ isActive: !user.isActive });

      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          id: user.id,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle user status'
      });
    }
  }

  // Get all roles
  async getRoles(req: AuthRequest, res: Response) {
    try {
      const roles = await Role.findAll({
        where: { 
          isActive: true,
          name: { [Op.ne]: 'Super Admin' } // Exclude Super Admin from dropdown
        },
        attributes: ['id', 'name', 'description'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles'
      });
    }
  }
}