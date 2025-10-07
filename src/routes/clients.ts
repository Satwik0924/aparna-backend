import { Router } from 'express';
import { body, query } from 'express-validator';
import { ClientController } from '../controllers/ClientController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const clientController = new ClientController();

// All client routes require JWT authentication
router.use(authenticateJWT);

// Get all clients
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('status').optional().isIn(['active', 'inactive'])
  ],
  validateRequest,
  clientController.getClients
);

// Get client by ID
router.get('/:id', clientController.getClient);

// Create new client
router.post('/',
  [
    body('companyName').isLength({ min: 2, max: 255 }),
    body('contactEmail').isEmail().normalizeEmail(),
    body('contactPhone').optional().isMobilePhone('any'),
    body('website').optional().isURL(),
    body('subscriptionPlan').isIn(['basic', 'premium', 'enterprise'])
  ],
  validateRequest,
  clientController.createClient
);

// Update client
router.put('/:id',
  [
    body('companyName').optional().isLength({ min: 2, max: 255 }),
    body('contactEmail').optional().isEmail().normalizeEmail(),
    body('contactPhone').optional().isMobilePhone('any'),
    body('website').optional().isURL(),
    body('subscriptionPlan').optional().isIn(['basic', 'premium', 'enterprise'])
  ],
  validateRequest,
  clientController.updateClient
);

// Delete client
router.delete('/:id', clientController.deleteClient);

// Generate new API key
router.post('/:id/regenerate-key', clientController.regenerateApiKey);

// Get client analytics
router.get('/:id/analytics', clientController.getClientAnalytics);

export default router;