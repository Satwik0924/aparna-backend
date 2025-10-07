import { Router } from 'express';
import SellDoLeadController from '../controllers/SellDoLeadController';
import { authenticateBoth } from '../middleware/auth';

const router = Router();

router.post('/submit', authenticateBoth, SellDoLeadController.submitLead);
router.get('/', authenticateBoth, SellDoLeadController.getAllLeads);
router.get('/stats', authenticateBoth, SellDoLeadController.getLeadsStats);
router.get('/:id', authenticateBoth, SellDoLeadController.getLeadById);

export default router;