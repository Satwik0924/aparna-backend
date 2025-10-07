// import { Router } from 'express';
// // import { body, query } from 'express-validator';
// // import { MenuController } from '../controllers/MenuController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
// const menuController = new MenuController();

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('type').optional().isString()
  ],
  validateRequest,
  menuController.getMenusAdmin
);

router.post('/admin',
  authenticateJWT,
  [
    body('name').isLength({ min: 2, max: 255 }),
    body('type').isIn(['header', 'footer', 'sidebar']),
    body('items').isArray()
  ],
  validateRequest,
  menuController.createMenu
);

router.put('/admin/:id',
  authenticateJWT,
  [
    body('name').optional().isLength({ min: 2, max: 255 }),
    body('type').optional().isIn(['header', 'footer', 'sidebar']),
    body('items').optional().isArray()
  ],
  validateRequest,
  menuController.updateMenu
);

router.delete('/admin/:id',
  authenticateJWT,
  menuController.deleteMenu
);

// Client API routes (API Key authentication)
router.get('/:type',
  authenticateAPIKey,
  menuController.getMenuByType
);

export default router;