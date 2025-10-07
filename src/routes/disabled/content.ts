// import { Router } from 'express';
// // import { body, query } from 'express-validator';
// // import { ContentController } from '../controllers/ContentController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
// const contentController = new ContentController();

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('type').optional().isString(),
    query('status').optional().isIn(['draft', 'published', 'archived'])
  ],
  validateRequest,
  contentController.getContentAdmin
);

router.get('/admin/:id',
  authenticateJWT,
  contentController.getContentByIdAdmin
);

router.post('/admin',
  authenticateJWT,
  [
    body('title').isLength({ min: 2, max: 255 }),
    body('content').optional().isString(),
    body('type').isIn(['page', 'blog', 'landing']),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    body('seoTitle').optional().isLength({ max: 255 }),
    body('seoDescription').optional().isLength({ max: 500 })
  ],
  validateRequest,
  contentController.createContent
);

router.put('/admin/:id',
  authenticateJWT,
  [
    body('title').optional().isLength({ min: 2, max: 255 }),
    body('content').optional().isString(),
    body('type').optional().isIn(['page', 'blog', 'landing']),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    body('seoTitle').optional().isLength({ max: 255 }),
    body('seoDescription').optional().isLength({ max: 500 })
  ],
  validateRequest,
  contentController.updateContent
);

router.delete('/admin/:id',
  authenticateJWT,
  contentController.deleteContent
);

// Client API routes (API Key authentication)
router.get('/:type',
  authenticateAPIKey,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString()
  ],
  validateRequest,
  contentController.getContentByType
);

router.get('/:type/:slug',
  authenticateAPIKey,
  contentController.getContentBySlug
);

export default router;