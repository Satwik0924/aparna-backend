// import { Router } from 'express';
// // import { body, query } from 'express-validator';
// // import { BannerController } from '../controllers/BannerController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
// const bannerController = new BannerController();

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['banner', 'carousel']),
    query('status').optional().isIn(['active', 'inactive'])
  ],
  validateRequest,
  bannerController.getBannersAdmin
);

router.post('/admin',
  authenticateJWT,
  [
    body('title').isLength({ min: 2, max: 255 }),
    body('type').isIn(['banner', 'carousel']),
    body('image').isURL(),
    body('link').optional().isURL(),
    body('description').optional().isString(),
    body('sortOrder').optional().isInt({ min: 0 })
  ],
  validateRequest,
  bannerController.createBanner
);

router.put('/admin/:id',
  authenticateJWT,
  [
    body('title').optional().isLength({ min: 2, max: 255 }),
    body('type').optional().isIn(['banner', 'carousel']),
    body('image').optional().isURL(),
    body('link').optional().isURL(),
    body('description').optional().isString(),
    body('sortOrder').optional().isInt({ min: 0 })
  ],
  validateRequest,
  bannerController.updateBanner
);

router.delete('/admin/:id',
  authenticateJWT,
  bannerController.deleteBanner
);

// Client API routes (API Key authentication)
router.get('/:type',
  authenticateAPIKey,
  bannerController.getBannersByType
);

export default router;