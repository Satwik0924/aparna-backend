// import { Router } from 'express';
// // import { body, query } from 'express-validator';
// // import { DropdownController } from '../controllers/DropdownController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
// const dropdownController = new DropdownController();

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('category').optional().isString()
  ],
  validateRequest,
  dropdownController.getDropdownsAdmin
);

router.post('/admin',
  authenticateJWT,
  [
    body('category').isLength({ min: 2, max: 100 }),
    body('label').isLength({ min: 1, max: 255 }),
    body('value').isLength({ min: 1, max: 255 }),
    body('sortOrder').optional().isInt({ min: 0 })
  ],
  validateRequest,
  dropdownController.createDropdown
);

router.put('/admin/:id',
  authenticateJWT,
  [
    body('category').optional().isLength({ min: 2, max: 100 }),
    body('label').optional().isLength({ min: 1, max: 255 }),
    body('value').optional().isLength({ min: 1, max: 255 }),
    body('sortOrder').optional().isInt({ min: 0 })
  ],
  validateRequest,
  dropdownController.updateDropdown
);

router.delete('/admin/:id',
  authenticateJWT,
  dropdownController.deleteDropdown
);

// Client API routes (API Key authentication)
router.get('/:category',
  authenticateAPIKey,
  dropdownController.getDropdownsByCategory
);

export default router;