import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { DropdownController } from '../controllers/DropdownController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const dropdownController = new DropdownController();

// Public API endpoint (requires x-api-key header with client ID)
router.get('/',
  [
    query('categories').optional().isString(),
    query('type').optional().isString()
  ],
  validateRequest,
  authenticateAPIKey,
  dropdownController.getPublicDropdowns
);

// All other dropdown routes require JWT authentication
router.use(authenticateJWT);

// Category routes
router.get('/categories',
  [
    query('search').optional().isString(),
    query('isActive').optional().isBoolean(),
    query('isClientCustomizable').optional().isBoolean(),
    query('level').optional().isInt({ min: 0, max: 1 }),
    query('parentId').optional().isUUID(),
    query('includeHierarchy').optional().isBoolean()
  ],
  validateRequest,
  dropdownController.getCategories
);

// Get hierarchical tree structure
router.get('/categories/tree',
  [
    query('isActive').optional().isBoolean()
  ],
  validateRequest,
  dropdownController.getCategoriesTree
);

router.get('/categories/:id',
  [
    param('id').isUUID()
  ],
  validateRequest,
  dropdownController.getCategory
);

router.post('/categories',
  [
    body('name').isLength({ min: 2, max: 100 }),
    body('description').optional().isString(),
    body('parentId').optional().isUUID(),
    body('sortOrder').optional().isInt({ min: 0 }),
    body('isClientCustomizable').optional().isBoolean()
  ],
  validateRequest,
  dropdownController.createCategory
);

router.put('/categories/:id',
  [
    param('id').isUUID(),
    body('name').optional().isLength({ min: 2, max: 100 }),
    body('description').optional().isString(),
    body('parentId').optional().isUUID(),
    body('sortOrder').optional().isInt({ min: 0 }),
    body('isClientCustomizable').optional().isBoolean(),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  dropdownController.updateCategory
);

router.delete('/categories/:id',
  [
    param('id').isUUID()
  ],
  validateRequest,
  dropdownController.deleteCategory
);

// Value routes
router.get('/categories/:categoryId/values',
  [
    param('categoryId').isUUID(),
    query('clientId').optional().isUUID(),
    query('search').optional().isString(),
    query('isActive').optional().isBoolean()
  ],
  validateRequest,
  dropdownController.getCategoryValues
);

// Get values by parent ID (for areas by city)
router.get('/values/parent/:parentId',
  [
    param('parentId').isUUID(),
    query('isActive').optional().isBoolean()
  ],
  validateRequest,
  dropdownController.getValuesByParent
);

// Debug route to test if routing works
router.get('/test-route', (req, res) => {
  res.json({ success: true, message: 'Test route working' });
});

// Route to get values by category name (alternative to UUID route)
router.get('/categories/name/:categoryName/values',
  [
    param('categoryName').isString().isLength({ min: 2, max: 100 }),
    query('clientId').optional().isUUID(),
    query('search').optional().isString(),
    query('isActive').optional().isBoolean()
  ],
  validateRequest,
  dropdownController.getCategoryValuesByName
);

router.post('/categories/:categoryId/values',
  [
    param('categoryId').isUUID(),
    body('value').isLength({ min: 1, max: 255 }),
    body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    body('icon').optional().isString().isLength({ max: 100 }),
    body('sortOrder').optional().isInt({ min: 0 }),
    body('clientId').optional().isUUID()
  ],
  validateRequest,
  dropdownController.createValue
);

router.put('/values/:id',
  [
    param('id').isUUID(),
    body('value').optional().isLength({ min: 1, max: 255 }),
    body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    body('icon').optional().isString().isLength({ max: 100 }),
    body('sortOrder').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  dropdownController.updateValue
);

router.delete('/values/:id',
  [
    param('id').isUUID()
  ],
  validateRequest,
  dropdownController.deleteValue
);

// Reorder values
router.post('/values/reorder',
  [
    body('values').optional().isArray(),
    body('values.*.id').optional().isUUID(),
    body('values.*.sortOrder').optional().isInt({ min: 0 }),
    body('valueIds').optional().isArray(),
    body('valueIds.*').optional().isUUID()
  ],
  validateRequest,
  dropdownController.reorderValues
);

// Client-specific routes
router.get('/client/:clientId/values',
  [
    param('clientId').isUUID(),
    query('categoryId').optional().isUUID()
  ],
  validateRequest,
  dropdownController.getClientValues
);

export default router;