import { Router } from 'express';
import MediaController, { uploadSingle, uploadMultiple } from '../controllers/MediaController';
import { authenticateJWT } from '../middleware/auth';
import { authenticateBoth } from '../middleware/auth'; 

const router = Router();

// Enable authentication for media routes
router.post('/resume/upload', authenticateBoth, uploadSingle, MediaController.uploadResume);
router.use(authenticateJWT);

// File operations
router.post('/upload', uploadSingle, MediaController.uploadSingleFile);
router.post('/upload-multiple', uploadMultiple, MediaController.uploadMultipleFiles);
router.get('/files', MediaController.listFiles);
router.get('/files/:id', MediaController.getFile);
router.get('/files/:id/usage', MediaController.getFileUsage);
router.delete('/files/:id', MediaController.deleteFile);
router.post('/files/delete-multiple', MediaController.deleteMultipleFiles);
router.put('/files/:id/move', MediaController.moveFile);



// Folder operations
router.post('/folders', MediaController.createFolder);
router.get('/folders', MediaController.listFolders);

export default router;