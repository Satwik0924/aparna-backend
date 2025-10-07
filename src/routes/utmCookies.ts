import { Router } from 'express';
import { query } from 'express-validator';
import { UTMCookieController } from '../controllers/UTMCookieController';
import { authenticateAPIKey, authenticateJWT, authenticateBoth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const utmCookieController = new UTMCookieController();

/**
 * UTM Cookie Management Routes
 * These endpoints handle UTM parameter tracking and cookie management
 */

// Set UTM cookies based on URL parameters or default values
// This is the main endpoint your landing pages will call
// Uses API Key authentication for frontend/website access
router.post('/set',
  authenticateAPIKey,
  [
    // Validate UTM parameters (all optional)
    query('utm_source').optional().isString().trim().isLength({ max: 255 }),
    query('utm_medium').optional().isString().trim().isLength({ max: 255 }),
    query('utm_campaign').optional().isString().trim().isLength({ max: 255 }),
    query('utm_term').optional().isString().trim().isLength({ max: 255 }),
    query('utm_content').optional().isString().trim().isLength({ max: 255 }),
  ],
  validateRequest,
  utmCookieController.setUTMCookies
);

// Alternative GET endpoint for setting cookies (for simple redirect scenarios)
// Uses API Key authentication for frontend/website access
router.get('/set',
  authenticateAPIKey,
  [
    // Same validation as POST
    query('utm_source').optional().isString().trim().isLength({ max: 255 }),
    query('utm_medium').optional().isString().trim().isLength({ max: 255 }),
    query('utm_campaign').optional().isString().trim().isLength({ max: 255 }),
    query('utm_term').optional().isString().trim().isLength({ max: 255 }),
    query('utm_content').optional().isString().trim().isLength({ max: 255 }),
  ],
  validateRequest,
  utmCookieController.setUTMCookies
);

// Get current UTM cookie values (for debugging/analytics)
// Uses both authentication methods for flexibility
router.get('/get',
  authenticateBoth,
  utmCookieController.getUTMCookies
);

// Clear all UTM cookies (for testing/debugging)
// Admin-only endpoint using JWT authentication
router.delete('/clear',
  authenticateJWT,
  utmCookieController.clearUTMCookies
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'UTM Cookie service is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /utm/set - Set UTM cookies',
      'GET /utm/set - Set UTM cookies (alternative)',
      'GET /utm/get - Get current UTM cookies',
      'DELETE /utm/clear - Clear all UTM cookies'
    ]
  });
});

export default router;