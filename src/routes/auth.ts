import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const authController = new AuthController();

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  validateRequest,
  authController.login
);


// Logout
router.post('/logout', authenticateJWT, authController.logout);

// Get current user
router.get('/me', authenticateJWT, authController.getCurrentUser);

// Update profile
router.put('/profile',
  authenticateJWT,
  [
    body('firstName').optional().isLength({ min: 2 }),
    body('lastName').optional().isLength({ min: 2 }),
    body('phone').optional().isMobilePhone('any')
  ],
  validateRequest,
  authController.updateProfile
);

// Change password
router.put('/password',
  authenticateJWT,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  validateRequest,
  authController.changePassword
);

export default router;