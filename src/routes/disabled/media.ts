// import { Router } from 'express';
// // import { body, query } from 'express-validator';
// // import { MediaController } from '../controllers/MediaController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import multer from 'multer';

// const router = Router();
const mediaController = new MediaController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedMimes = [
      'image/jpeg',
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
      cb(new Error('Invalid file type'));
    }
  }
});

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('type').optional().isString(),
    query('folder').optional().isString()
  ],
  validateRequest,
  mediaController.getMediaAdmin
);

router.post('/admin/upload',
  authenticateJWT,
  upload.array('files', 10),
  mediaController.uploadMedia
);

router.delete('/admin/:id',
  authenticateJWT,
  mediaController.deleteMedia
);

// Client API routes (API Key authentication)
router.get('/',
  authenticateAPIKey,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isString()
  ],
  validateRequest,
  mediaController.getMedia
);

export default router;