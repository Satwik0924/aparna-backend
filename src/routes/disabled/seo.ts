// import { Router } from 'express';
// // import { body, query } from 'express-validator';
// // import { SEOController } from '../controllers/SEOController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
// const seoController = new SEOController();

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('entityType').optional().isString(),
    query('search').optional().isString()
  ],
  validateRequest,
  seoController.getSEODataAdmin
);

router.post('/admin',
  authenticateJWT,
  [
    body('entityType').isIn(['property', 'content', 'page']),
    body('entityId').isUUID(),
    body('title').isLength({ min: 1, max: 255 }),
    body('description').isLength({ min: 1, max: 500 }),
    body('keywords').optional().isString(),
    body('canonicalUrl').optional().isURL()
  ],
  validateRequest,
  seoController.createSEOData
);

router.put('/admin/:id',
  authenticateJWT,
  [
    body('title').optional().isLength({ min: 1, max: 255 }),
    body('description').optional().isLength({ min: 1, max: 500 }),
    body('keywords').optional().isString(),
    body('canonicalUrl').optional().isURL()
  ],
  validateRequest,
  seoController.updateSEOData
);

router.delete('/admin/:id',
  authenticateJWT,
  seoController.deleteSEOData
);

// Client API routes (API Key authentication)
router.get('/entity/:entityType/:entityId',
  authenticateAPIKey,
  seoController.getSEODataByEntity
);

export default router;