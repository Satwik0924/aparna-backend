import { Router } from 'express';
import { BlogCategoryController } from '../controllers/blog/BlogCategoryController';
import { authenticateBoth } from '../middleware/auth';

const router = Router();
const blogCategoryController = new BlogCategoryController();

// =============================================================================
// ROUTES (JWT Authentication OR X-API-Key Authentication)
// =============================================================================

router.get('/', authenticateBoth, blogCategoryController.getCategories.bind(blogCategoryController));
router.get('/:id', authenticateBoth, blogCategoryController.getCategoryById.bind(blogCategoryController));
router.post('/', authenticateBoth, blogCategoryController.createCategory.bind(blogCategoryController));
router.put('/:id', authenticateBoth, blogCategoryController.updateCategory.bind(blogCategoryController));
router.delete('/:id', authenticateBoth, blogCategoryController.deleteCategory.bind(blogCategoryController));
router.post('/bulk-delete', authenticateBoth, blogCategoryController.bulkDeleteCategories.bind(blogCategoryController));

export default router;
export { router as blogCategoryRoutes };