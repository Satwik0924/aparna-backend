import { Router } from 'express';
import { body, query } from 'express-validator';
import { ProjectCarouselController } from '../controllers/ProjectCarouselController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const projectCarouselController = new ProjectCarouselController();

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('isActive').optional().isBoolean()
  ],
  validateRequest,
  projectCarouselController.getCarouselsAdmin
);

router.get('/admin/:id',
  authenticateJWT,
  projectCarouselController.getCarouselAdmin
);

router.post('/admin',
  authenticateJWT,
  [
    body('name').notEmpty().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validateRequest,
  projectCarouselController.createCarousel
);

router.put('/admin/:id',
  authenticateJWT,
  [
    body('name').optional().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validateRequest,
  projectCarouselController.updateCarousel
);

router.delete('/admin/:id',
  authenticateJWT,
  projectCarouselController.deleteCarousel
);

// Carousel items routes
router.post('/admin/:id/items',
  authenticateJWT,
  [
    body('propertyId').isUUID().withMessage('Property ID must be a valid UUID'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
  ],
  validateRequest,
  projectCarouselController.addCarouselItem
);

router.delete('/admin/:id/items/:itemId',
  authenticateJWT,
  projectCarouselController.removeCarouselItem
);

router.put('/admin/:id/items/reorder',
  authenticateJWT,
  [
    body('itemOrder').isArray().withMessage('itemOrder must be an array'),
    body('itemOrder.*.id').isUUID().withMessage('Each item must have a valid UUID'),
    body('itemOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  projectCarouselController.reorderCarouselItems
);

// Public API routes (API Key authentication)
router.get('/',
  authenticateAPIKey,
  [
    query('cityId').optional().isUUID().withMessage('City ID must be a valid UUID'),
    query('areaId').optional().isUUID().withMessage('Area ID must be a valid UUID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validateRequest,
  projectCarouselController.getCarouselsPublic
);

router.get('/slug/:slug',
  authenticateAPIKey,
  [
    query('cityId').optional().isUUID().withMessage('City ID must be a valid UUID'),
    query('areaId').optional().isUUID().withMessage('Area ID must be a valid UUID')
  ],
  validateRequest,
  projectCarouselController.getCarouselBySlug
);

router.get('/:id',
  authenticateAPIKey,
  projectCarouselController.getCarouselById
);

export default router;