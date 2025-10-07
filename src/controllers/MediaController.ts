import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    clientId?: string;
  };
}
import multer from 'multer';
import { Op } from 'sequelize';
import {
  uploadFile,
  uploadFiles,
  deleteFile,
  deleteFiles,
  listFiles,
  moveFile,
  MediaFolder,
} from '../utils/digitalOceanSpaces';
import MediaFile from '../models/MediaFile';
import MediaFolderModel from '../models/MediaFolder';
import { sequelize } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 20); // Max 20 files at once

class MediaController {
  // Check if media file is being used anywhere
  private async checkMediaFileUsage(fileId: string) {
    const usage = [];
    
    try {
      // Check ContentItem references
      const [contentItems] = await sequelize.query(
        'SELECT id, title FROM content_items WHERE featured_image_id = ? AND is_active = true',
        { replacements: [fileId] }
      );
      if (contentItems.length > 0) {
        usage.push({
          type: 'ContentItem',
          table: 'content_items',
          field: 'featured_image_id',
          references: contentItems
        });
      }

      // Check Banner references
      const [banners] = await sequelize.query(
        'SELECT id, name FROM banners WHERE image_id = ? AND is_active = true',
        { replacements: [fileId] }
      );
      if (banners.length > 0) {
        usage.push({
          type: 'Banner',
          table: 'banners',
          field: 'image_id',
          references: banners
        });
      }

      // Check CarouselItem references
      const [carouselItems] = await sequelize.query(
        'SELECT id, title FROM carousel_items WHERE image_id = ? AND is_active = true',
        { replacements: [fileId] }
      );
      if (carouselItems.length > 0) {
        usage.push({
          type: 'CarouselItem',
          table: 'carousel_items',
          field: 'image_id',
          references: carouselItems
        });
      }

    } catch (error: any) {
      console.error('Error checking media file usage:', error.message);
      // Return empty usage array if queries fail - allow deletion to proceed
    }

    return usage;
  }
  // Upload single file
  async uploadSingleFile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { folder = MediaFolder.IMAGES, resize } = req.body;
      // Get clientId from authenticated user
      const clientId = req.user?.clientId;
      
      if (!clientId) {
        return res.status(400).json({ 
          error: 'User must be associated with a client to upload files' 
        });
      }


let resizeOptions;
if (resize) {
  const parsedResize = JSON.parse(resize);
  resizeOptions = {
    ...parsedResize,
    quality: parsedResize.quality || 100 // Use provided quality or high default
  };
}

      // Upload to Digital Ocean Spaces
      const uploadResult = await uploadFile(req.file, req.file.originalname, {
        folder: folder as MediaFolder,
        resize: resizeOptions,
        metadata: {
          uploadedBy: req.user?.id || 'system',
          clientId: clientId || 'global',
        },
      });

      // Save to database
      const mediaFile = await MediaFile.create({
        id: uuidv4(),
        clientId: clientId,
        fileName: uploadResult.key.split('/').pop() || '',
        originalName: req.file.originalname,
        filePath: uploadResult.key,
        spacesUrl: uploadResult.url,
        cdnUrl: uploadResult.cdnUrl,
        fileType: uploadResult.mimeType.startsWith('image/') ? 'image' : 
                 uploadResult.mimeType.startsWith('video/') ? 'video' : 
                 uploadResult.mimeType.includes('pdf') ? 'document' : 'other',
        mimeType: uploadResult.mimeType,
        fileSize: uploadResult.size,
        folderId: null,
        uploadedBy: req.user?.id || 'system',
        isActive: true,
      });

      res.json({
        success: true,
        data: {
          file: {
            id: mediaFile.id,
            url: mediaFile.cdnUrl,
            key: mediaFile.filePath,
            fileName: mediaFile.fileName,
            mimeType: mediaFile.mimeType,
            size: mediaFile.fileSize,
          },
        },
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: 'Failed to upload file',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const { folder = MediaFolder.IMAGES, resize } = req.body;
      // Get clientId from authenticated user
      const clientId = req.user?.clientId;
      
      if (!clientId) {
        return res.status(400).json({ 
          error: 'User must be associated with a client to upload files' 
        });
      }

      // Parse resize options if provided
      let resizeOptions;
      if (resize) {
        resizeOptions = JSON.parse(resize);
      }

      // Upload all files
      const uploadResults = await uploadFiles(files, {
        folder: folder as MediaFolder,
        resize: resizeOptions,
        metadata: {
          uploadedBy: req.user?.id || 'system',
          clientId: clientId || 'global',
        },
      });

      // Save to database
      const mediaFiles = await Promise.all(
        uploadResults.map((result, index) =>
          MediaFile.create({
            id: uuidv4(),
            clientId: clientId,
            fileName: result.key.split('/').pop() || '',
            originalName: files[index].originalname,
            filePath: result.key,
            spacesUrl: result.url,
            cdnUrl: result.cdnUrl,
            fileType: result.mimeType.startsWith('image/') ? 'image' : 
                     result.mimeType.startsWith('video/') ? 'video' : 
                     result.mimeType.includes('pdf') ? 'document' : 'other',
            mimeType: result.mimeType,
            fileSize: result.size,
            folderId: null,
            uploadedBy: req.user?.id || 'system',
            isActive: true,
          })
        )
      );

      res.json({
        success: true,
        data: {
          files: mediaFiles.map((file: MediaFile) => ({
            id: file.id,
            url: file.cdnUrl,
            key: file.filePath,
            fileName: file.fileName,
            mimeType: file.mimeType,
            size: file.fileSize,
          })),
        },
      });
    } catch (error) {
      console.error('Batch upload error:', error);
      res.status(500).json({ error: 'Failed to upload files' });
    }
  }

  // List files
  async listFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const { folder, page = 1, limit = 50 } = req.query;
      const clientId = req.user?.clientId;

      console.log(`📋 List files request - folder: ${folder}, page: ${page}, limit: ${limit}, clientId: ${clientId}`);

      if (!clientId) {
        return res.status(400).json({ 
          error: 'User must be associated with a client to access files' 
        });
      }

      // Build where conditions
      const where: any = { 
        isActive: true,
        clientId: clientId 
      };

      // Apply folder filter if provided
      if (folder) {
        // Decode URL-encoded folder name and replace + with spaces, then convert to lowercase with underscores
        const decodedFolder = decodeURIComponent(String(folder).replace(/\+/g, ' '))
          .toLowerCase()
          .replace(/\s+/g, '_');
        console.log(`📂 Original folder: ${folder}, Decoded folder: ${decodedFolder}`);
        
        // Folder filtering by file path prefix (e.g., "work_in_progress/" folder)
        where.filePath = {
          [Op.like]: `${decodedFolder}%`
        };
      }

      console.log(`📋 Query where conditions:`, where);

      // Calculate offset for pagination
      const offset = (Number(page) - 1) * Number(limit);

      // Get total count for pagination
      const totalCount = await MediaFile.count({ where });

      // Get files with pagination
      const rows = await MediaFile.findAll({
        where,
        limit: Number(limit),
        offset: offset,
        order: [['created_at', 'DESC']],
      });

      console.log(`📋 Found ${rows.length} files out of ${totalCount} total`);

      res.json({
        success: true,
        data: {
          files: rows.map((file: MediaFile) => ({
            id: file.id,
            url: file.cdnUrl,
            key: file.filePath,
            fileName: file.fileName,
            mimeType: file.mimeType,
            size: file.fileSize,
            createdAt: file.createdAt,
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalCount,
            totalPages: Math.ceil(totalCount / Number(limit)),
          },
          filters: {
            folder: folder || 'all',
            clientId: clientId,
          }
        },
      });
    } catch (error) {
      console.error('List files error:', error);
      res.status(500).json({ error: 'Failed to list files' });
    }
  }

  // Delete file
  async deleteFile(req: AuthenticatedRequest, res: Response) {
    const mediaController = this;
    
    try {
      const { id } = req.params;
      const { force = false } = req.query; // Allow force deletion via query param
      const clientId = req.user?.clientId;

      console.log(`🗑️ Delete request for media file: ${id}, clientId: ${clientId}, force: ${force}`);

      if (!clientId) {
        return res.status(400).json({ 
          error: 'User must be associated with a client to delete files' 
        });
      }

      // Find file in database with client filter
      const where: any = { 
        id,
        clientId: clientId 
      };

      console.log(`🔍 Query where condition:`, where);
      const file = await MediaFile.findOne({ where });
      
      if (!file) {
        console.log(`❌ Media file not found in DB: ${id}`);
        return res.status(404).json({ error: 'File not found in database' });
      }

      console.log(`📄 Found media file: ${file.fileName} at ${file.filePath}`);

      // Check if file is being used unless force deletion is requested
      if (!force) {
        console.log(`🔍 Checking media file usage...`);
        const usage = await mediaController.checkMediaFileUsage(id);
        
        if (usage.length > 0) {
          console.log(`⚠️ Media file is in use:`, usage);
          return res.status(409).json({
            error: 'File is currently in use and cannot be deleted',
            usage: usage,
            message: 'This file is referenced by other content. Use force=true to delete anyway (will set references to null).'
          });
        }
        console.log(`✅ Media file is not in use, safe to delete`);
      } else {
        console.log(`⚠️ Force deletion requested - skipping usage check`);
      }

      // Delete from database only (will set references to NULL due to foreign key constraints)
      console.log(`💾 Deleting from database...`);
      await file.destroy();
      console.log(`✅ Successfully deleted from database`);

      res.json({ 
        success: true, 
        message: 'File deleted successfully',
        note: force ? 'Force deletion completed - any references have been set to null' : 'File deleted safely'
      });
    } catch (error: any) {
      console.error('Delete file error:', error);
      res.status(500).json({ 
        error: 'Failed to delete file',
        details: error.message 
      });
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const { ids } = req.body;
      const clientId = req.user?.clientId;

      if (!clientId) {
        return res.status(400).json({ 
          error: 'User must be associated with a client to delete files' 
        });
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No file IDs provided' });
      }

      // Find files in database with client filter
      const where: any = { 
        id: ids,
        clientId: clientId 
      };

      const files = await MediaFile.findAll({ where });

      if (files.length === 0) {
        return res.status(404).json({ error: 'No files found' });
      }

      // Delete from database only (no Digital Ocean deletion)
      await MediaFile.destroy({ where });

      res.json({
        success: true,
        message: `${files.length} files deleted successfully`,
      });
    } catch (error) {
      console.error('Delete multiple files error:', error);
      res.status(500).json({ error: 'Failed to delete files' });
    }
  }

  // Move file to different folder
  async moveFile(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { folder } = req.body;
      const clientId = req.user?.clientId;

      if (!clientId) {
        return res.status(400).json({ 
          error: 'User must be associated with a client to move files' 
        });
      }

      if (!folder) {
        return res.status(400).json({ error: 'Target folder not provided' });
      }

      // Find file in database with client filter
      const where: any = { 
        id,
        clientId: clientId 
      };

      const file = await MediaFile.findOne({ where });
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Generate new key
      const fileName = file.filePath.split('/').pop() || '';
      const newKey = `${folder}/${fileName}`;

      // Move file in Digital Ocean Spaces
      const result = await moveFile(file.filePath, newKey);

      // Update database
      file.filePath = result.key;
      file.spacesUrl = result.url;
      file.cdnUrl = result.cdnUrl;
      await file.save();

      res.json({
        success: true,
        file: {
          id: file.id,
          url: file.cdnUrl,
          key: file.filePath,
          fileName: file.fileName,
          mimeType: file.mimeType,
          size: file.fileSize,
        },
      });
    } catch (error) {
      console.error('Move file error:', error);
      res.status(500).json({ error: 'Failed to move file' });
    }
  }

  // Get file details
  async getFile(req: AuthenticatedRequest, res: Response) {
    const mediaController = this;
    
    try {
      const { id } = req.params;
      const { includeUsage = false } = req.query;
      const clientId = req.user?.clientId;

      if (!clientId) {
        return res.status(400).json({ 
          error: 'User must be associated with a client to access files' 
        });
      }

      const where: any = { 
        id,
        clientId: clientId 
      };

      const file = await MediaFile.findOne({ where });
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const fileDetails: any = {
        id: file.id,
        url: file.cdnUrl,
        key: file.filePath,
        fileName: file.fileName,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.fileSize,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      };

      // Include usage information if requested
      if (includeUsage === 'true') {
        const usage = await mediaController.checkMediaFileUsage(id);
        fileDetails.usage = usage;
        fileDetails.isInUse = usage.length > 0;
      }

      res.json({
        success: true,
        file: fileDetails,
      });
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({ error: 'Failed to get file details' });
    }
  }

  // Get file usage information
  async getFileUsage(req: AuthenticatedRequest, res: Response) {
    const mediaController = this;
    
    try {
      const { id } = req.params;
      const clientId = req.user?.clientId;

      if (!clientId) {
        return res.status(400).json({ 
          error: 'User must be associated with a client to access files' 
        });
      }

      // Verify file exists and user has access
      const where: any = { 
        id,
        clientId: clientId 
      };

      const file = await MediaFile.findOne({ where });
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const usage = await mediaController.checkMediaFileUsage(id);

      res.json({
        success: true,
        fileId: id,
        fileName: file.fileName,
        isInUse: usage.length > 0,
        usage: usage,
        canDelete: usage.length === 0,
        message: usage.length > 0 
          ? `File is referenced by ${usage.length} item(s) and cannot be safely deleted`
          : 'File is not in use and can be safely deleted'
      });
    } catch (error) {
      console.error('Get file usage error:', error);
      res.status(500).json({ error: 'Failed to get file usage information' });
    }
  }

  // Create folder
  async createFolder(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, parentId } = req.body;
      const clientId = req.user?.clientId;

      if (!name) {
        return res.status(400).json({ error: 'Folder name is required' });
      }

      const folder = await MediaFolderModel.create({
        id: uuidv4(),
        clientId: clientId || 'global',
        name,
        parentId,
        path: await MediaFolderModel.generatePath(name, parentId),
        isActive: true,
      });

      res.json({
        success: true,
        folder: {
          id: folder.id,
          name: folder.name,
          parentId: folder.parentId,
        },
      });
    } catch (error) {
      console.error('Create folder error:', error);
      res.status(500).json({ error: 'Failed to create folder' });
    }
  }

  // List folders
  async listFolders(req: AuthenticatedRequest, res: Response) {
    try {
      const { parentId } = req.query;
      const clientId = req.user?.clientId;

      if (!clientId) {
        return res.status(400).json({ 
          error: 'User must be associated with a client to access folders' 
        });
      }

      const where: any = { clientId: clientId };
      if (parentId !== undefined) where.parentId = parentId || null;

      const folders = await MediaFolderModel.findAll({
        where,
        order: [['name', 'ASC']],
      });

      res.json({
        success: true,
        folders: folders.map((folder: MediaFolderModel) => ({
          id: folder.id,
          name: folder.name,
          parentId: folder.parentId,
        })),
      });
    } catch (error) {
      console.error('List folders error:', error);
      res.status(500).json({ error: 'Failed to list folders' });
    }
  }
  // Resume upload (for career applications)
// Resume upload (for career applications)
// Resume upload (for career applications)
async uploadResume(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file provided' });
    }

    const clientId = req.user?.clientId;
    
    if (!clientId) {
      return res.status(400).json({ 
        error: 'User must be associated with a client to upload resumes' 
      });
    }

    // Validate file type for resumes
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed for resumes.'
      });
    }

    // Upload to Digital Ocean Spaces in resumes folder
    const uploadResult = await uploadFile(req.file, req.file.originalname, {
      folder: MediaFolder.RESUMES,
      metadata: {
        uploadedBy: req.user?.id || 'api-upload',
        clientId: clientId || 'global',
        type: 'resume',
        uploadDate: new Date().toISOString()
      },
    });

    // Handle uploadedBy for API key uploads
    const uploadedById: string | null = req.user?.id || null;

    // Save to database
    const mediaFile = await MediaFile.create({
      id: uuidv4(),
      clientId: clientId,
      fileName: uploadResult.key.split('/').pop() || '',
      originalName: req.file.originalname,
      filePath: uploadResult.key,
      spacesUrl: uploadResult.url,
      cdnUrl: uploadResult.cdnUrl,
      fileType: 'document',
      mimeType: uploadResult.mimeType,
      fileSize: uploadResult.size,
      folderId: null,
      uploadedBy: uploadedById, // Now properly typed as string | null
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        file: {
          id: mediaFile.id,
          url: mediaFile.cdnUrl,
          key: mediaFile.filePath,
          fileName: mediaFile.fileName,
          mimeType: mediaFile.mimeType,
          size: mediaFile.fileSize,
        },
      },
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload resume',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
}

export default new MediaController();