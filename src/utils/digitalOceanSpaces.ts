import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sharp from 'sharp';

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY!,  // ✅ FIXED
  secretAccessKey: process.env.AWS_S3_SECRET_KEY!,  // ✅ FIXED
  region: process.env.AWS_S3_REGION || 'ap-south-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'aparna-constructions-media';
const CDN_ENDPOINT = process.env.AWS_CLOUDFRONT_DOMAIN || 'https://d2tdzhum1kggza.cloudfront.net';

// Supported file types
const SUPPORTED_FILE_TYPES = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  videos: ['mp4', 'webm', 'mov', 'avi'],
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
  icons: ['svg', 'png', 'ico'],
};

// Folder structure
export enum MediaFolder {
  PROJECTS = 'projects',
  BLOG = 'blog',                    
  BLOG_IMAGES = 'blog/images',       
  BLOG_FEATURED = 'blog/featured',  
  BLOG_DOCUMENTS = 'blog/docs',     
  ICONS = 'icons',
  VIDEOS = 'videos', 
  IMAGES = 'images',
  DOCUMENTS = 'documents',
  RESUMES = 'resumes',
  TEMP = 'temp',
}

interface UploadOptions {
  folder?: MediaFolder;
  fileName?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
  resize?: {
    width?: number;
    height?: number;
  };
  projectId?: string;
  subFolder?: string;
}

interface UploadResult {
  key: string;
  url: string;
  cdnUrl: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, string>;
}

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase().slice(1);
};

// Helper function to validate file type
const validateFileType = (filename: string, folder?: MediaFolder): boolean => {
  const ext = getFileExtension(filename);
  
  if (folder === MediaFolder.ICONS) {
    return SUPPORTED_FILE_TYPES.icons.includes(ext);
  } else if (folder === MediaFolder.VIDEOS) {
    return SUPPORTED_FILE_TYPES.videos.includes(ext);
  } else if (folder === MediaFolder.DOCUMENTS) {
    return SUPPORTED_FILE_TYPES.documents.includes(ext);
  }
  
  return Object.values(SUPPORTED_FILE_TYPES).flat().includes(ext);
};

// Generate unique filename with timestamp
const generateUniqueFileName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-');
  const timestamp = Date.now();
  const shortId = uuidv4().split('-')[0];
  return `${sanitizedName}-${timestamp}-${shortId}${ext}`;
};

// Simple image processing - PRESERVE ORIGINAL QUALITY
const processImage = async (
  buffer: Buffer,
  options?: UploadOptions['resize']
): Promise<Buffer> => {
  // If no resize options, return original buffer
  if (!options || (!options.width && !options.height)) {
    return buffer;
  }

  const metadata = await sharp(buffer).metadata();
  const originalFormat = metadata.format;
  let sharpInstance = sharp(buffer);

  // Only resize if dimensions specified
  if (options.width || options.height) {
    sharpInstance = sharpInstance.resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Preserve original format and maximum quality
  switch (originalFormat) {
    case 'jpeg':
    case 'jpg':
      return await sharpInstance
        .jpeg({ quality: 100 })
        .toBuffer();

    case 'png':
      return await sharpInstance
        .png({ compressionLevel: 0 })
        .toBuffer();

    case 'webp':
      return await sharpInstance
        .webp({ lossless: true })
        .toBuffer();

    default:
      return await sharpInstance.toBuffer();
  }
};

// Single file upload with ENHANCED CLARITY
export const uploadFile = async (
  file: Express.Multer.File | Buffer,
  originalName: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const buffer = Buffer.isBuffer(file) ? file : file.buffer;
    let mimeType = Buffer.isBuffer(file) ? 'application/octet-stream' : file.mimetype;
    
    const ext = getFileExtension(originalName);
    
    if (ext === 'svg') {
      mimeType = 'image/svg+xml';
    }
    
    if (!validateFileType(originalName, options.folder)) {
      throw new Error(`File type not supported for ${originalName}`);
    }


let processedBuffer = buffer;
console.log('🔍 Debug info:', {
  ext,
  isImage: SUPPORTED_FILE_TYPES.images.includes(ext),
  isSvg: ext === 'svg',
  hasResize: !!options.resize,
  resizeOptions: options.resize,
  originalSize: buffer.length
});

if (SUPPORTED_FILE_TYPES.images.includes(ext) && ext !== 'svg' && options.resize && (options.resize.width || options.resize.height)) {
  console.log('🔄 Processing image through Sharp');
  processedBuffer = await processImage(buffer, options.resize);
} else {
  console.log('✅ Skipping image processing - using original buffer');
}

console.log('📊 Final buffer size:', processedBuffer.length);

    const fileName = options.fileName || generateUniqueFileName(originalName);
    const folder = options.folder || MediaFolder.IMAGES;
    
    let key: string;
    if (options.projectId && folder === MediaFolder.PROJECTS) {
      if (options.subFolder) {
        key = `${folder}/${options.projectId}/${options.subFolder}/${fileName}`;
      } else {
        key = `${folder}/${options.projectId}/${fileName}`;
      }
    } else {
      key = `${folder}/${fileName}`;
    }

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: processedBuffer,
      ContentType: mimeType,
      Metadata: {
        ...options.metadata,
        'processed-at': new Date().toISOString()
      },
      ...(ext === 'svg' && {
        ContentDisposition: 'inline',
        CacheControl: 'public, max-age=31536000',
      }),
    };

    const result = await s3.upload(uploadParams).promise();

    return {
      key: result.Key,
      url: `${CDN_ENDPOINT}/${result.Key}`,
      cdnUrl: `${CDN_ENDPOINT}/${result.Key}`,
      size: processedBuffer.length,
      mimeType,
      metadata: options.metadata,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Batch upload
export const uploadFiles = async (
  files: Express.Multer.File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) =>
    uploadFile(file, file.originalname, options)
  );

  try {
    const results = await Promise.allSettled(uploadPromises);
    
    const successful: UploadResult[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push(`${files[index].originalname}: ${result.reason.message}`);
      }
    });

    if (failed.length > 0) {
      console.warn('Some files failed to upload:', failed);
    }

    return successful;
  } catch (error) {
    console.error('Error in batch upload:', error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (key: string): Promise<void> => {
  try {
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: key,
    }).promise();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Delete multiple files
export const deleteFiles = async (keys: string[]): Promise<void> => {
  try {
    await s3.deleteObjects({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    }).promise();
  } catch (error) {
    console.error('Error deleting files:', error);
    throw error;
  }
};

// List files in a folder
export const listFiles = async (
  folder: MediaFolder,
  maxKeys: number = 1000
): Promise<AWS.S3.Object[]> => {
  try {
    const result = await s3.listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: `${folder}/`,
      MaxKeys: maxKeys,
    }).promise();

    return result.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Get signed URL for private files
export const getSignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    return s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Create folder
export const createFolder = async (folderPath: string): Promise<void> => {
  try {
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: `${folderPath}/`,
      Body: '',
    }).promise();
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Copy file
export const copyFile = async (
  sourceKey: string,
  destinationKey: string
): Promise<UploadResult> => {
  try {
    await s3.copyObject({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    }).promise();

    const headResult = await s3.headObject({
      Bucket: BUCKET_NAME,
      Key: destinationKey,
    }).promise();

    return {
      key: destinationKey,
      url: `${CDN_ENDPOINT}/${destinationKey}`,
      cdnUrl: `${CDN_ENDPOINT}/${destinationKey}`,
      size: headResult.ContentLength || 0,
      mimeType: headResult.ContentType || 'application/octet-stream',
      metadata: headResult.Metadata,
    };
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
};

// Move file
export const moveFile = async (
  sourceKey: string,
  destinationKey: string
): Promise<UploadResult> => {
  try {
    const result = await copyFile(sourceKey, destinationKey);
    await deleteFile(sourceKey);
    return result;
  } catch (error) {
    console.error('Error moving file:', error);
    throw error;
  }
};

// Ensure project folder exists
export const ensureProjectFolderExists = async (projectId: string): Promise<void> => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${MediaFolder.PROJECTS}/${projectId}/.project-info.json`
    };

    try {
      await s3.headObject(params).promise();
    } catch (error: any) {
      if (error.code === 'NotFound') {
        console.log(`📁 Creating missing project folder for: ${projectId}`);
        await createProjectFolder(projectId);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error ensuring project folder exists:', error);
  }
};

// Property banner upload - PRESERVE ORIGINAL QUALITY
export const uploadPropertyBanner = async (
  file: Express.Multer.File | Buffer,
  originalName: string,
  propertyId: string,
  bannerType: 'desktop' | 'mobile'
): Promise<UploadResult> => {
  await ensureProjectFolderExists(propertyId);

  const options: UploadOptions = {
    folder: MediaFolder.PROJECTS,
    projectId: propertyId,
    fileName: `banner-${bannerType}-${generateUniqueFileName(originalName)}`,
    isPublic: true,
    resize: bannerType === 'desktop' 
      ? { width: 1920, height: 1080 }
      : { width: 768, height: 1024 },
    metadata: {
      'banner-type': bannerType,
      'property-id': propertyId,
      'upload-timestamp': new Date().toISOString()
    }
  };

  return uploadFile(file, originalName, options);
};

// Create project folder structure
export const createProjectFolder = async (projectId: string): Promise<void> => {
  try {
    const placeholderContent = JSON.stringify({
      projectId,
      createdAt: new Date().toISOString(),
      structure: {
        banners: 'Desktop and mobile banner images',
        gallery: 'Property gallery images',
        documents: 'Property documents and brochures',
        floorPlans: 'Floor plan images',
        videos: 'Property videos and virtual tours'
      }
    }, null, 2);

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: `${MediaFolder.PROJECTS}/${projectId}/.project-info.json`,
      Body: Buffer.from(placeholderContent, 'utf-8'),
      ContentType: 'application/json',
      Metadata: {
        'project-id': projectId,
        'file-type': 'project-metadata',
        'created-at': new Date().toISOString()
      }
    };

    await s3.upload(uploadParams).promise();
    console.log(`✅ Created project folder structure for: ${projectId}`);
  } catch (error) {
    console.error('Error creating project folder:', error);
  }
};

// Clean up project folder
export const deleteProjectFolder = async (projectId: string): Promise<void> => {
  try {
    const listParams = {
      Bucket: BUCKET_NAME,
      Prefix: `${MediaFolder.PROJECTS}/${projectId}/`
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();
    
    if (listedObjects.Contents && listedObjects.Contents.length > 0) {
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key! }))
        }
      };

      await s3.deleteObjects(deleteParams).promise();
      console.log(`✅ Deleted project folder and all contents for: ${projectId}`);
    }
  } catch (error) {
    console.error('Error deleting project folder:', error);
    throw error;
  }
};

// Blog featured image upload - PRESERVE ORIGINAL QUALITY
export const uploadBlogFeaturedImage = async (
  file: Express.Multer.File,
  clientId: string,
  postSlug?: string
): Promise<UploadResult> => {
  const options: UploadOptions = {
    folder: MediaFolder.BLOG_FEATURED,
    fileName: `${postSlug || 'draft'}-${generateUniqueFileName(file.originalname)}`,
    // resize: { width: 1200, height: 630 }, // ← REMOVED THIS LINE
    metadata: {
      'client-id': clientId,
      'post-slug': postSlug || 'draft',
      'type': 'blog-featured',
      'upload-date': new Date().toISOString()
    }
  };
  
  return uploadFile(file, file.originalname, options);
};

// Blog content images upload - PRESERVE ORIGINAL QUALITY
export const uploadBlogContentImages = async (
  files: Express.Multer.File[],
  clientId: string
): Promise<UploadResult[]> => {
  const options: UploadOptions = {
    folder: MediaFolder.BLOG_IMAGES,
    // resize: { width: 800 }, // ← REMOVED THIS LINE
    metadata: {
      'client-id': clientId,
      'type': 'blog-content',
      'upload-date': new Date().toISOString()
    }
  };
  
  return uploadFiles(files, options);
};

// Blog documents upload
export const uploadBlogDocuments = async (
  files: Express.Multer.File[],
  clientId: string
): Promise<UploadResult[]> => {
  const options: UploadOptions = {
    folder: MediaFolder.BLOG_DOCUMENTS,
    metadata: {
      'client-id': clientId,
      'type': 'blog-document',
      'upload-date': new Date().toISOString()
    }
  };
  
  return uploadFiles(files, options);
};

// Clean up blog media
export const deleteBlogMedia = async (mediaKeys: string[]): Promise<void> => {
  return deleteFiles(mediaKeys);
};

// Legacy aliases
export const uploadToSpaces = uploadFile;
export const deleteFromSpaces = deleteFile;