import { Router } from 'express';
import { BlogTagController } from '../controllers/blog/BlogTagController';
import { authenticateBoth } from '../middleware/auth';

const router = Router();
const blogTagController = new BlogTagController();

// =============================================================================
// ROUTES (JWT Authentication OR X-API-Key Authentication)
// =============================================================================

router.get('/', authenticateBoth, blogTagController.getTags.bind(blogTagController));
router.get('/:id', authenticateBoth, blogTagController.getTagById.bind(blogTagController));
router.post('/', authenticateBoth, blogTagController.createTag.bind(blogTagController));
router.put('/:id', authenticateBoth, blogTagController.updateTag.bind(blogTagController));
router.delete('/:id', authenticateBoth, blogTagController.deleteTag.bind(blogTagController));
router.post('/bulk-delete', authenticateBoth, blogTagController.bulkDeleteTags.bind(blogTagController));

export default router;
export { router as blogTagRoutes };