// import { Router } from 'express';
// // import { body, query } from 'express-validator';
// // import { FAQController } from '../controllers/FAQController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
// const faqController = new FAQController();

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().isString(),
    query('search').optional().isString()
  ],
  validateRequest,
  faqController.getFAQsAdmin
);

router.post('/admin',
  authenticateJWT,
  [
    body('question').isLength({ min: 5, max: 500 }),
    body('answer').isLength({ min: 5, max: 2000 }),
    body('category').optional().isString(),
    body('sortOrder').optional().isInt({ min: 0 })
  ],
  validateRequest,
  faqController.createFAQ
);

router.put('/admin/:id',
  authenticateJWT,
  [
    body('question').optional().isLength({ min: 5, max: 500 }),
    body('answer').optional().isLength({ min: 5, max: 2000 }),
    body('category').optional().isString(),
    body('sortOrder').optional().isInt({ min: 0 })
  ],
  validateRequest,
  faqController.updateFAQ
);

router.delete('/admin/:id',
  authenticateJWT,
  faqController.deleteFAQ
);

// Client API routes (API Key authentication)
router.get('/',
  authenticateAPIKey,
  [
    query('category').optional().isString(),
    query('propertyId').optional().isUUID()
  ],
  validateRequest,
  faqController.getFAQs
);

export default router;