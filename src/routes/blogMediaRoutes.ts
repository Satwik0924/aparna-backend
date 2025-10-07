import { Router } from 'express';
import multer from 'multer';
import { BlogMediaController } from '../controllers/blog/BlogMediaController';
import { authenticateBoth } from '../middleware/auth';

const router = Router();
const blogMediaController = new BlogMediaController();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// =============================================================================
// ROUTES (JWT Authentication OR X-API-Key Authentication)
// =============================================================================

// Upload routes
router.post('/upload/single', authenticateBoth, upload.single('file'), blogMediaController.uploadMedia.bind(blogMediaController));
router.post('/upload/multiple', authenticateBoth, upload.array('files', 10), blogMediaController.uploadMedia.bind(blogMediaController));
router.post('/upload/featured', authenticateBoth, upload.single('file'), blogMediaController.uploadMedia.bind(blogMediaController));
router.post('/upload/documents', authenticateBoth, upload.array('files', 5), blogMediaController.uploadMedia.bind(blogMediaController));

// CRUD routes
router.get('/', authenticateBoth, blogMediaController.getAllMedia.bind(blogMediaController));
router.get('/stats', authenticateBoth, blogMediaController.getMediaStats.bind(blogMediaController));
router.get('/:id', authenticateBoth, blogMediaController.getMediaById.bind(blogMediaController));
router.put('/:id', authenticateBoth, blogMediaController.updateMedia.bind(blogMediaController));
router.delete('/:id', authenticateBoth, blogMediaController.deleteMedia.bind(blogMediaController));

export default router;
export { router as blogMediaRoutes };