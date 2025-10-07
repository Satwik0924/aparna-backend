import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../../middleware/auth';
import BlogMedia from '../../models/BlogMedia';
import BlogPost from '../../models/BlogPost';
import BlogSeo from '../../models/BlogSeo';
import Client from '../../models/Client';
import User from '../../models/User';
import { uploadBlogContentImages, uploadBlogFeaturedImage, uploadBlogDocuments, deleteBlogMedia } from '../../utils/digitalOceanSpaces';

interface MulterRequest extends AuthRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export class BlogMediaController {
  // Upload media files (handles single/multiple, featured/content/documents)
 // In BlogMediaController.ts - Update the uploadMedia method response

async uploadMedia(req: MulterRequest, res: Response) {
  try {
    const user = req.user!;
    const { type = 'content', postSlug, altText, altTexts } = req.body;
    const file = req.file;
    const files = Array.isArray(req.files) ? req.files : [];

    if (!file && files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No file(s) provided'
      });
    }

    const filesToProcess = file ? [file] : files;
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    // Validate file types based on upload type
    const allowedTypes = type === 'document' ? [...allowedImageTypes, ...allowedDocTypes] : allowedImageTypes;
    const invalidFiles = filesToProcess.filter(f => !allowedTypes.includes(f.mimetype));
    
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type(s): ${invalidFiles.map(f => f.originalname).join(', ')}`
      });
    }

    // Upload files based on type
    let uploadResults;
    if (type === 'featured' && file) {
      uploadResults = [await uploadBlogFeaturedImage(file, user.clientId!, postSlug)];
    } else if (type === 'document') {
      uploadResults = await uploadBlogDocuments(filesToProcess, user.clientId!);
    } else {
      uploadResults = await uploadBlogContentImages(filesToProcess, user.clientId!);
    }

    // Parse altTexts for multiple files
    let parsedAltTexts: string[] = [];
    if (altTexts) {
      try {
        parsedAltTexts = typeof altTexts === 'string' ? JSON.parse(altTexts) : altTexts;
      } catch (e) {
        parsedAltTexts = [];
      }
    }

    // Save to database
    const blogMediaItems = await Promise.all(
      uploadResults.map((uploadResult, index) => {
        const currentFile = filesToProcess[index];
        return BlogMedia.create({
          clientId: user.clientId!,
          fileName: currentFile.originalname,
          spacesKey: uploadResult.key,
          link: uploadResult.cdnUrl,
          fileType: currentFile.originalname.split('.').pop()?.toLowerCase() || 'unknown',
          fileSize: uploadResult.size,
          altText: (file ? altText : parsedAltTexts[index]) || currentFile.originalname,
          // Remove uploadedBy for now since there's a data type mismatch
          // uploadedBy: Number(user.id)
        });
      })
    );

    // FIX: Return UUID as 'id' for frontend compatibility
    const formattedResults = blogMediaItems.map(media => ({
      id: media.uuid,    // ← CHANGED: Use UUID as 'id' for frontend
      uuid: media.uuid,  // Keep UUID field for compatibility
      fileName: media.fileName,
      link: media.getUrl(),
      fileType: media.fileType,
      fileSize: media.fileSize,
      formattedSize: media.getFormattedFileSize(),
      altText: media.altText,
      isImage: media.isImage(),
      isVideo: media.isVideo(),
      isDocument: media.isDocument(),
      createdAt: media.createdAt
    }));

    res.status(201).json({
      success: true,
      message: `${blogMediaItems.length} media file(s) uploaded successfully`,
      data: file ? formattedResults[0] : formattedResults,
      count: blogMediaItems.length
    });

  } catch (error: any) {
    console.error('Error uploading blog media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

  // Get all blog media with pagination and filters
  async getAllMedia(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const {
        page = '1',
        limit = '20',
        fileType,
        mediaType, // image, video, document
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      // Build where conditions
      const whereConditions: any = { clientId: user.clientId };

      if (fileType && typeof fileType === 'string') {
        whereConditions.fileType = { [Op.like]: `%${fileType}%` };
      }

      if (mediaType && typeof mediaType === 'string') {
        const typeMap = {
          image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
          video: ['mp4', 'webm', 'mov', 'avi'],
          document: ['pdf', 'doc', 'docx', 'xls', 'xlsx']
        };
        const types = typeMap[mediaType as keyof typeof typeMap];
        if (types) {
          whereConditions.fileType = { [Op.in]: types };
        }
      }

      if (search && typeof search === 'string') {
        whereConditions[Op.or] = [
          { fileName: { [Op.like]: `%${search}%` } },
          { altText: { [Op.like]: `%${search}%` } }
        ];
      }

      // Validate and set sorting
      const allowedSortFields = ['createdAt', 'updatedAt', 'fileName', 'fileSize'];
      const sortField = allowedSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
      const sortDirection = (typeof sortOrder === 'string' && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

      // Get total count and paginated results
      const { count, rows } = await BlogMedia.findAndCountAll({
        where: whereConditions,
        order: [[sortField, sortDirection]],
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit)
      });

   // In BlogMediaController.ts - Update the getAllMedia method response

const formattedMedia = rows.map(media => ({
  id: media.uuid,       // ← CHANGED: Use UUID as 'id' for frontend consistency
  uuid: media.uuid,     // Keep UUID field for compatibility
  fileName: media.fileName,
  link: media.getUrl(),
  fileType: media.fileType,
  fileSize: media.fileSize,
  formattedSize: media.getFormattedFileSize(),
  altText: media.altText,
  isImage: media.isImage(),
  isVideo: media.isVideo(),
  isDocument: media.isDocument(),
  uploadedBy: media.uploadedBy,
  createdAt: media.createdAt,
  updatedAt: media.updatedAt
}));

      res.json({
        success: true,
        data: {
          media: formattedMedia,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count / Number(limit))
          }
        }
      });

    } catch (error: any) {
      console.error('Error fetching blog media:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch media',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get blog media by ID
async getMediaById(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { id } = req.params;

    // Build where condition - only use numeric ID if it's actually a number
    const whereCondition: any = { clientId: user.clientId };
    
    // Check if id is a valid number (for legacy numeric IDs)
    const numericId = Number(id);
    if (!isNaN(numericId) && Number.isInteger(numericId)) {
      whereCondition[Op.or] = [{ id: numericId }, { uuid: id }];
    } else {
      // If it's not a valid number, treat it as UUID only
      whereCondition.uuid = id;
    }

    const media = await BlogMedia.findOne({
      where: whereCondition
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: media.uuid,       // Use UUID as 'id' for frontend consistency
        uuid: media.uuid,     // Keep UUID field for compatibility
        fileName: media.fileName,
        link: media.getUrl(),
        fileType: media.fileType,
        fileSize: media.fileSize,
        formattedSize: media.getFormattedFileSize(),
        altText: media.altText,
        isImage: media.isImage(),
        isVideo: media.isVideo(),
        isDocument: media.isDocument(),
        uploadedBy: media.uploadedBy,
        createdAt: media.createdAt,
        updatedAt: media.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Error fetching blog media by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

  // Update blog media (mainly for alt text and file name)
 async updateMedia(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { altText, fileName } = req.body;

    // Build where condition - only use numeric ID if it's actually a number
    const whereCondition: any = { clientId: user.clientId };
    
    // Check if id is a valid number (for legacy numeric IDs)
    const numericId = Number(id);
    if (!isNaN(numericId) && Number.isInteger(numericId)) {
      whereCondition[Op.or] = [{ id: numericId }, { uuid: id }];
    } else {
      // If it's not a valid number, treat it as UUID only
      whereCondition.uuid = id;
    }

    const media = await BlogMedia.findOne({
      where: whereCondition
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    await media.update({
      ...(altText && { altText }),
      ...(fileName && { fileName })
    });

    res.json({
      success: true,
      message: 'Media updated successfully',
      data: {
        id: media.uuid,
        uuid: media.uuid,
        fileName: media.fileName,
        altText: media.altText,
        updatedAt: media.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Error updating blog media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update media',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

  // Delete blog media
 async deleteMedia(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { id } = req.params;

    // Build where condition - only use numeric ID if it's actually a number
    const whereCondition: any = { clientId: user.clientId };
    
    // Check if id is a valid number (for legacy numeric IDs)
    const numericId = Number(id);
    if (!isNaN(numericId) && Number.isInteger(numericId)) {
      whereCondition[Op.or] = [{ id: numericId }, { uuid: id }];
    } else {
      // If it's not a valid number, treat it as UUID only
      whereCondition.uuid = id;
    }

    const media = await BlogMedia.findOne({
      where: whereCondition
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if media is used anywhere
    const [postsUsingAsFeatured, seoOgUsage, seoTwitterUsage] = await Promise.all([
      BlogPost.count({
        where: {
          clientId: user.clientId,
          featuredImageId: media.id
        }
      }),
      BlogSeo.count({
        where: {
          clientId: user.clientId,
          ogImageId: media.id
        }
      }),
      BlogSeo.count({
        where: {
          clientId: user.clientId,
          twitterImageId: media.id
        }
      })
    ]);

    const totalUsage = postsUsingAsFeatured + seoOgUsage + seoTwitterUsage;

    if (totalUsage > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete media that is currently in use'
      });
    }

    // Delete from Digital Ocean Spaces
    if (media.spacesKey) {
      try {
        await deleteBlogMedia([media.spacesKey]);
      } catch (cdnError) {
        console.error('Error deleting from CDN:', cdnError);
        // Continue with database deletion even if CDN deletion fails
      }
    }

    // Delete from database
    await media.destroy();

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting blog media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

  // Get media statistics
  async getMediaStats(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;

      const [totalCount, imageCount, videoCount, documentCount, totalSize] = await Promise.all([
        BlogMedia.count({ where: { clientId: user.clientId } }),
        BlogMedia.count({ 
          where: { 
            clientId: user.clientId,
            fileType: { [Op.in]: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] }
          }
        }),
        BlogMedia.count({ 
          where: { 
            clientId: user.clientId,
            fileType: { [Op.in]: ['mp4', 'webm', 'mov', 'avi'] }
          }
        }),
        BlogMedia.count({ 
          where: { 
            clientId: user.clientId,
            fileType: { [Op.in]: ['pdf', 'doc', 'docx', 'xls', 'xlsx'] }
          }
        }),
        BlogMedia.sum('fileSize', { where: { clientId: user.clientId } })
      ]);

      res.json({
        success: true,
        data: {
          totalFiles: totalCount,
          images: imageCount,
          videos: videoCount,
          documents: documentCount,
          totalSize: totalSize || 0,
          formattedTotalSize: this.formatFileSize(totalSize || 0)
        }
      });

    } catch (error: any) {
      console.error('Error fetching media stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch media statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper method to format file size
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}