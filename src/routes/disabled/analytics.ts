// import { Router } from 'express';
// // import { query } from 'express-validator';
// // import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
// const analyticsController = new AnalyticsController();

// All analytics routes require JWT authentication
router.use(authenticateJWT);

// Get dashboard statistics
router.get('/dashboard',
  analyticsController.getDashboardStats
);

// Get API usage statistics
router.get('/api-usage',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'year']),
    query('clientId').optional().isUUID()
  ],
  validateRequest,
  analyticsController.getAPIUsage
);

// Get property analytics
router.get('/properties',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'year']),
    query('propertyId').optional().isUUID()
  ],
  validateRequest,
  analyticsController.getPropertyAnalytics
);

// Get content analytics
router.get('/content',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'year']),
    query('contentType').optional().isString()
  ],
  validateRequest,
  analyticsController.getContentAnalytics
);

export default router;