import { Router } from 'express';
import { body, query } from 'express-validator';
import { UserController } from '../controllers/UserController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const userController = new UserController();

// All user routes require JWT authentication
router.use(authenticateJWT);

// Get all users
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('role').optional().isString(),
    query('status').optional().isIn(['active', 'inactive'])
  ],
  validateRequest,
  userController.getUsers
);

// Get all roles (must be before /:id route)
router.get('/roles', userController.getRoles);

// Get user by ID
router.get('/:id', userController.getUser);

// Create new user
router.post('/',
  [
    body('firstName').isLength({ min: 2, max: 100 }),
    body('lastName').isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('roleId').isUUID(),
    body('clientId').optional().isUUID()
  ],
  validateRequest,
  userController.createUser
);

// Update user
router.put('/:id',
  [
    body('firstName').optional().isLength({ min: 2, max: 100 }),
    body('lastName').optional().isLength({ min: 2, max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('roleId').optional().isUUID(),
    body('clientId').optional().isUUID()
  ],
  validateRequest,
  userController.updateUser
);

// Delete user
router.delete('/:id', userController.deleteUser);

// Update user password
router.patch('/:id/password',
  [
    body('newPassword').isLength({ min: 6 }),
    body('currentPassword').optional().isString()
  ],
  validateRequest,
  userController.updateUserPassword
);

// Toggle user status
router.patch('/:id/toggle-status', userController.toggleUserStatus);

export default router;