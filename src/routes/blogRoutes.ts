import { Router } from 'express';
import { BlogPostController } from '../controllers/blog/BlogPostCreateController';
import { BlogGetPostController } from '../controllers/blog/BlogPostGetAllController';
import { BlogGetSinglePostController } from '../controllers/blog/BlogPostGetSingleController';
import { BlogPostEditController } from '../controllers/blog/BlogPostEditController';
import { BlogPostDeleteController } from '../controllers/blog/BlogPostDeleteController';
import { BlogPostsByCategoryController } from '../controllers/blog/BlogPostsByCategoryController';
import { BlogRecommendedPostsController } from '../controllers/blog/BlogRecommendedPostsController';
import { authenticateBoth } from '../middleware/auth';

const router = Router();
const blogPostController = new BlogPostController();
const blogGetPostController = new BlogGetPostController();
const blogGetSinglePostController = new BlogGetSinglePostController();
const blogPostEditController = new BlogPostEditController();
const blogPostDeleteController = new BlogPostDeleteController();
const blogPostsByCategoryController = new BlogPostsByCategoryController();
const blogRecommendedPostsController = new BlogRecommendedPostsController();

// =============================================================================
// ROUTES (JWT Authentication OR X-API-Key Authentication)
// =============================================================================

// Core CRUD operations
router.post('/', authenticateBoth, blogPostController.createPost.bind(blogPostController));
router.get('/', authenticateBoth, blogGetPostController.getAllPosts.bind(blogGetPostController));
router.get('/:idOrSlug', authenticateBoth, blogGetSinglePostController.getPostByIdOrSlug.bind(blogGetSinglePostController));
router.put('/:id', authenticateBoth, blogPostEditController.editPost.bind(blogPostEditController));
router.delete('/:id', authenticateBoth, blogPostDeleteController.deletePost.bind(blogPostDeleteController));

// Delete operations
router.post('/bulk-delete', authenticateBoth, blogPostDeleteController.deleteBulkPosts.bind(blogPostDeleteController));
router.patch('/:id/archive', authenticateBoth, blogPostDeleteController.archivePost.bind(blogPostDeleteController));

// Category-based operations
router.get('/category/:slug', authenticateBoth, blogPostsByCategoryController.getPostsByCategory.bind(blogPostsByCategoryController));
router.get('/category/:slug/info', authenticateBoth, blogPostsByCategoryController.getCategoryWithPostCount.bind(blogPostsByCategoryController));
router.get('/:postIdOrSlug/recommended', authenticateBoth, blogRecommendedPostsController.getRecommendedPosts.bind(blogRecommendedPostsController));

// router.get('/tag/:slug', authenticateBoth, blogPostController.getPostsByTag.bind(blogPostController));           // Coming next

export default router;
export { router as blogPostRoutes };