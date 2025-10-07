import { Router } from 'express';
import { body, query } from 'express-validator';
import { PropertyController } from '../controllers/PropertyController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    fieldSize: 50 * 1024 * 1024, // 50MB limit per field
    files: 20, // Maximum 20 files
    fields: 100 // Maximum 100 non-file fields
  }
});

// Middleware to handle multer errors
const handleMulterErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({
          success: false,
          message: 'File too large. Maximum size allowed is 50MB.',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 20 files allowed.',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many fields in the request.',
          error: 'TOO_MANY_FIELDS'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.',
          error: 'UNEXPECTED_FILE'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message,
          error: 'UPLOAD_ERROR'
        });
    }
  }
  
  // If it's not a multer error, pass it to the next error handler
  next(err);
};

const router = Router();
const propertyController = new PropertyController();

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('propertyType').optional().isUUID()
  ],
  validateRequest,
  propertyController.getPropertiesAdmin
);

router.post('/admin/search',
  authenticateJWT,
  [
    body('page').optional().isInt({ min: 1 }),
    body('limit').optional().isInt({ min: 1, max: 100 }),
    body('propertyType').optional().isUUID(),
    body('filters').optional().isObject()
  ],
  validateRequest,
  propertyController.getPropertiesAdminWithFilters
);

// Property reorder route - MUST be before /admin/:id
router.put('/admin/reorder',
  authenticateJWT,
  [
    body('propertyOrder').isArray().withMessage('propertyOrder must be an array'),
    body('propertyOrder.*.id').isUUID().withMessage('Each property must have a valid UUID'),
    body('propertyOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.reorderProperties
);

router.get('/admin/:id',
  authenticateJWT,
  propertyController.getPropertyAdmin
);

router.post('/admin',
  authenticateJWT,
  [
    body('name').isLength({ min: 2, max: 255 }).withMessage('Property name must be between 2 and 255 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('propertyType').optional().isString().withMessage('Property type must be a string'),
    body('configurationId').optional().isUUID(),
    body('cityId').optional().isUUID(),
    body('areaId').optional().isUUID(),
    body('priceRangeId').optional().isUUID()
  ],
  validateRequest,
  propertyController.createProperty
);

router.put('/admin/:id',
  authenticateJWT,
  [
    body('name').optional().isLength({ min: 2, max: 255 }),
    body('description').optional().isString(),
    body('price').optional().isFloat({ min: 0 }),
    body('priceType').optional().isIn(['fixed', 'negotiable', 'on_request']),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('propertyTypeId').optional().isUUID(),
    body('statusId').optional().isUUID(),
    body('configurationId').optional().isUUID(),
    body('cityId').optional().isUUID(),
    body('areaId').optional().isUUID(),
    body('priceRangeId').optional().isUUID(),
    body('address').optional().isLength({ min: 5 }),
    body('city').optional().isLength({ min: 2 }),
    body('state').optional().isLength({ min: 2 }),
    body('country').optional().isLength({ min: 2 }),
    body('area').optional().isFloat({ min: 0 }),
    body('areaUnit').optional().isIn(['sq_ft', 'sq_m', 'acres', 'hectares'])
  ],
  validateRequest,
  propertyController.updateProperty
);

router.delete('/admin/:id',
  authenticateJWT,
  propertyController.deleteProperty
);

// Banner routes
router.post('/admin/:id/banner/upload',
  authenticateJWT,
  upload.single('banner'),
  handleMulterErrors,
  [
    body('bannerType').isIn(['desktop', 'mobile']).withMessage('Banner type must be desktop or mobile'),
    body('altText').optional().isString().withMessage('Alt text must be a string')
  ],
  validateRequest,
  propertyController.uploadPropertyBannerImage
);

router.put('/admin/:id/banner/info',
  authenticateJWT,
  [
    body('bannerLinkUrl').optional().isURL().withMessage('Banner link URL must be a valid URL'),
    body('bannerLinkText').optional().isString().withMessage('Banner link text must be a string'),
    body('bannerDesktopAlt').optional().isString().withMessage('Banner desktop alt text must be a string'),
    body('bannerMobileAlt').optional().isString().withMessage('Banner mobile alt text must be a string')
  ],
  validateRequest,
  propertyController.updatePropertyBannerInfo
);

router.delete('/admin/:id/banner',
  authenticateJWT,
  [
    body('bannerType').isIn(['desktop', 'mobile']).withMessage('Banner type must be desktop or mobile')
  ],
  validateRequest,
  propertyController.deletePropertyBanner
);

// Logo routes
router.post('/admin/:id/logo/upload',
  authenticateJWT,
  upload.single('logo'),
  handleMulterErrors,
  [
    body('altText').optional().isString().withMessage('Alt text must be a string')
  ],
  validateRequest,
  propertyController.uploadPropertyLogo
);

router.delete('/admin/:id/logo',
  authenticateJWT,
  propertyController.deletePropertyLogo
);

router.put('/admin/:id/logo/info',
  authenticateJWT,
  [
    body('logoAlt').optional().isString().withMessage('Logo alt text must be a string'),
    body('logoTitle').optional().isString().withMessage('Logo title must be a string'),
    body('logoDescription').optional().isString().withMessage('Logo description must be a string')
  ],
  validateRequest,
  propertyController.updatePropertyLogoInfo
);

// Price Appreciation Sticker routes
router.post('/admin/:id/price-appreciation-sticker/upload',
  authenticateJWT,
  upload.single('sticker'),
  handleMulterErrors,
  [
    body('altText').optional().isString().withMessage('Alt text must be a string')
  ],
  validateRequest,
  propertyController.uploadPropertyPriceAppreciationSticker
);

router.delete('/admin/:id/price-appreciation-sticker',
  authenticateJWT,
  propertyController.deletePropertyPriceAppreciationSticker
);

router.put('/admin/:id/price-appreciation-sticker/info',
  authenticateJWT,
  [
    body('priceAppreciationStickerAlt').optional().isString().withMessage('Price appreciation sticker alt text must be a string'),
    body('priceAppreciationStickerTitle').optional().isString().withMessage('Price appreciation sticker title must be a string'),
    body('priceAppreciationStickerDescription').optional().isString().withMessage('Price appreciation sticker description must be a string'),
    body('priceAppreciationStickerActive').optional().isBoolean().withMessage('Price appreciation sticker active status must be a boolean')
  ],
  validateRequest,
  propertyController.updatePropertyPriceAppreciationStickerInfo
);

// Gallery routes
router.get('/admin/:id/gallery',
  authenticateJWT,
  propertyController.getPropertyGalleryAdmin
);

router.post('/admin/:id/gallery/upload',
  authenticateJWT,
  upload.array('images', 20), // Allow up to 20 images
  handleMulterErrors,
  propertyController.uploadGalleryImages
);

router.put('/admin/:id/gallery/order',
  authenticateJWT,
  [
    body('imageOrder').isArray().withMessage('imageOrder must be an array'),
    body('imageOrder.*.id').isUUID().withMessage('Each image must have a valid UUID'),
    body('imageOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a positive integer')
  ],
  validateRequest,
  propertyController.updateGalleryOrder
);

router.delete('/admin/:id/gallery/:imageId',
  authenticateJWT,
  propertyController.deleteGalleryImage
);

router.put('/admin/:id/gallery/:imageId/primary',
  authenticateJWT,
  propertyController.setPrimaryGalleryImage
);

router.put('/admin/:id/gallery/:imageId',
  authenticateJWT,
  propertyController.updateGalleryImageMetadata
);

// Misc Images routes
router.get('/admin/:id/misc-images',
  authenticateJWT,
  propertyController.getPropertyMiscImages
);

router.post('/admin/:id/misc-images/upload',
  authenticateJWT,
  upload.array('images', 20), // Allow up to 20 misc images
  handleMulterErrors,
  propertyController.uploadMiscImages
);

router.put('/admin/:id/misc-images/order',
  authenticateJWT,
  [
    body('imageOrder').isArray().withMessage('imageOrder must be an array'),
    body('imageOrder.*.id').isUUID().withMessage('Each image must have a valid UUID'),
    body('imageOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a positive integer')
  ],
  validateRequest,
  propertyController.updateMiscImagesOrder
);

router.put('/admin/:id/misc-images/:imageId',
  authenticateJWT,
  [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('altText').optional().isString().withMessage('Alt text must be a string')
  ],
  validateRequest,
  propertyController.updateMiscImage
);

router.delete('/admin/:id/misc-images/:imageId',
  authenticateJWT,
  propertyController.deleteMiscImage
);

// Banner Carousel routes
router.get('/admin/:id/banner-carousel/:type',
  authenticateJWT,
  propertyController.getBannerCarouselImages
);

router.post('/admin/:id/banner-carousel/upload',
  authenticateJWT,
  upload.array('files', 20), // Allow up to 20 images
  handleMulterErrors,
  [
    body('type').isIn(['desktop', 'mobile']).withMessage('Type must be desktop or mobile')
  ],
  validateRequest,
  propertyController.uploadBannerCarouselImages
);

router.put('/admin/:id/banner-carousel/order',
  authenticateJWT,
  [
    body('orderData').isArray().withMessage('orderData must be an array'),
    body('orderData.*.id').isUUID().withMessage('Each image must have a valid UUID'),
    body('orderData.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a positive integer'),
    body('type').isIn(['desktop', 'mobile']).withMessage('Type must be desktop or mobile')
  ],
  validateRequest,
  propertyController.updateBannerCarouselOrder
);

router.put('/admin/:id/banner-carousel/:imageId',
  authenticateJWT,
  [
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('altText').optional().isString().withMessage('Alt text must be a string'),
    body('type').optional().isIn(['desktop', 'mobile']).withMessage('Type must be desktop or mobile')
  ],
  validateRequest,
  propertyController.updateBannerCarouselImage
);

router.delete('/admin/:id/banner-carousel/:imageId',
  authenticateJWT,
  [
    query('type').isIn(['desktop', 'mobile']).withMessage('Type must be desktop or mobile')
  ],
  validateRequest,
  propertyController.deleteBannerCarouselImage
);

// Floor plan routes
router.get('/admin/:id/floor-plans',
  authenticateJWT,
  propertyController.getPropertyFloorPlans
);

router.post('/admin/:id/floor-plans/upload',
  authenticateJWT,
  upload.array('floorPlans', 10), // Allow up to 10 floor plans
  handleMulterErrors,
  propertyController.uploadFloorPlans
);

router.put('/admin/:id/floor-plans/order',
  authenticateJWT,
  propertyController.updateFloorPlanOrder
);

router.put('/admin/:id/floor-plans/:floorPlanId',
  authenticateJWT,
  [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('altText').optional().isString().withMessage('Alt text must be a string')
  ],
  validateRequest,
  propertyController.updateFloorPlan
);

router.delete('/admin/:id/floor-plans/:floorPlanId',
  authenticateJWT,
  propertyController.deleteFloorPlan
);

// Layout routes (clone of floor plan routes)
router.get('/admin/:id/layouts',
  authenticateJWT,
  propertyController.getPropertyLayouts
);

router.post('/admin/:id/layouts/upload',
  authenticateJWT,
  upload.array('layouts', 10), // Allow up to 10 layouts
  handleMulterErrors,
  propertyController.uploadLayouts
);

router.put('/admin/:id/layouts/order',
  authenticateJWT,
  propertyController.updateLayoutOrder
);

router.put('/admin/:id/layouts/:layoutId',
  authenticateJWT,
  [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('altText').optional().isString().withMessage('Alt text must be a string')
  ],
  validateRequest,
  propertyController.updateLayout
);

router.delete('/admin/:id/layouts/:layoutId',
  authenticateJWT,
  propertyController.deleteLayout
);

// Generic image routes
router.get('/admin/:id/images',
  authenticateJWT,
  [
    query('component_type').optional().isString().isLength({ max: 50 }).withMessage('Component type must be a string with max 50 characters')
  ],
  validateRequest,
  propertyController.getPropertyImagesAdmin
);

// Generic image delete route - works for any image type
router.delete('/admin/:id/images/:imageId',
  authenticateJWT,
  propertyController.deletePropertyImage
);

// Basic Info routes
router.get('/admin/:id/basic-info',
  authenticateJWT,
  propertyController.getPropertyBasicInfo
);

router.put('/admin/:id/basic-info',
  authenticateJWT,
  [
    body('buildingPermissionNumber').notEmpty().trim().withMessage('Building Permission Number is required'),
    body('reraNumber').notEmpty().trim().withMessage('RERA Number is required'),
    body('reraWebsite').notEmpty().isURL().withMessage('Valid RERA Website URL is required'),
    body('basicData').optional().isArray().withMessage('Basic data must be an array'),
    body('sectionTitle').optional().isString().withMessage('Section title must be a string'),
    body('sectionTexts').optional().isArray().withMessage('Section texts must be an array')
  ],
  validateRequest,
  propertyController.updatePropertyBasicInfo
);

// Highlights routes
router.get('/admin/:id/highlights',
  authenticateJWT,
  propertyController.getPropertyHighlights
);

router.put('/admin/:id/highlights',
  authenticateJWT,
  [
    body('highlightsData').optional().isArray().withMessage('Highlights data must be an array'),
    body('sectionTitle').optional().isString().withMessage('Section title must be a string'),
    body('sectionTexts').optional().isArray().withMessage('Section texts must be an array')
  ],
  validateRequest,
  propertyController.updatePropertyHighlights
);

// Location Highlights routes
router.get('/admin/:id/location-highlights',
  authenticateJWT,
  propertyController.getPropertyLocationHighlightsAdmin
);

router.post('/admin/:id/location-highlights',
  authenticateJWT,
  [
    body('level').isInt({ min: 1, max: 3 }).withMessage('Level must be 1, 2, or 3'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('value').optional().isString().withMessage('Value must be a string'),
    body('iconId').optional().isUUID().withMessage('Icon ID must be a valid UUID'),
    body('parentId').optional().isUUID().withMessage('Parent ID must be a valid UUID')
  ],
  validateRequest,
  propertyController.createLocationHighlight
);

// Reorder location highlights (must be before :highlightId route)
router.put('/admin/:id/location-highlights/reorder',
  authenticateJWT,
  [
    body('highlightOrder').isArray().withMessage('highlightOrder must be an array'),
    body('highlightOrder.*.id').isUUID().withMessage('Each highlight must have a valid UUID'),
    body('highlightOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.reorderLocationHighlights
);

router.put('/admin/:id/location-highlights/:highlightId',
  authenticateJWT,
  [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('value').optional().isString().withMessage('Value must be a string'),
    body('iconId').optional().isUUID().withMessage('Icon ID must be a valid UUID')
  ],
  validateRequest,
  propertyController.updateLocationHighlight
);

router.delete('/admin/:id/location-highlights/:highlightId',
  authenticateJWT,
  propertyController.deleteLocationHighlight
);

// Amenities Highlights routes
router.get('/admin/:id/amenities-highlights',
  authenticateJWT,
  propertyController.getPropertyAmenitiesHighlights
);

router.post('/admin/:id/amenities-highlights',
  authenticateJWT,
  [
    body('level').isInt({ min: 1, max: 3 }).withMessage('Level must be 1, 2, or 3'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('value').optional().isString().withMessage('Value must be a string'),
    body('iconId').optional().isUUID().withMessage('Icon ID must be a valid UUID'),
    body('parentId').optional().isUUID().withMessage('Parent ID must be a valid UUID')
  ],
  validateRequest,
  propertyController.createAmenitiesHighlight
);

router.put('/admin/:id/amenities-highlights/:highlightId',
  authenticateJWT,
  [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('value').optional().isString().withMessage('Value must be a string'),
    body('iconId').optional().isUUID().withMessage('Icon ID must be a valid UUID')
  ],
  validateRequest,
  propertyController.updateAmenitiesHighlight
);

router.delete('/admin/:id/amenities-highlights/:highlightId',
  authenticateJWT,
  propertyController.deleteAmenitiesHighlight
);

// Overview Highlights routes
router.get('/admin/:id/overview-highlights',
  authenticateJWT,
  propertyController.getPropertyOverviewHighlightsAdmin
);

router.post('/admin/:id/overview-highlights',
  authenticateJWT,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('iconId').optional().isUUID().withMessage('Icon ID must be a valid UUID')
  ],
  validateRequest,
  propertyController.createOverviewHighlight
);

// Reorder overview highlights (must be before :highlightId route)
router.put('/admin/:id/overview-highlights/reorder',
  authenticateJWT,
  [
    body('highlightOrder').isArray().withMessage('highlightOrder must be an array'),
    body('highlightOrder.*.id').isUUID().withMessage('Each highlight must have a valid UUID'),
    body('highlightOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.reorderOverviewHighlights
);

router.put('/admin/:id/overview-highlights/:highlightId',
  authenticateJWT,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('iconId').optional().isUUID().withMessage('Icon ID must be a valid UUID')
  ],
  validateRequest,
  propertyController.updateOverviewHighlight
);

router.delete('/admin/:id/overview-highlights/:highlightId',
  authenticateJWT,
  propertyController.deleteOverviewHighlight
);

// Videos routes
router.get('/admin/:id/videos',
  authenticateJWT,
  propertyController.getPropertyVideos
);

router.put('/admin/:id/videos',
  authenticateJWT,
  [
    body('videos').isArray().withMessage('Videos must be an array'),
    body('videos.*.url').notEmpty().withMessage('Video URL is required'),
    body('videos.*.title').notEmpty().withMessage('Video title is required')
  ],
  validateRequest,
  propertyController.updatePropertyVideos
);

// Text Components routes
router.get('/admin/:id/text-components',
  authenticateJWT,
  propertyController.getPropertyTextComponents
);

router.post('/admin/:id/text-components',
  authenticateJWT,
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('title').optional().isString().withMessage('Title must be a string'),
    body('iconId').optional().isUUID().withMessage('Icon ID must be a valid UUID'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validateRequest,
  propertyController.createTextComponent
);

router.put('/admin/:id/text-components/:componentId',
  authenticateJWT,
  [
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('title').optional().isString().withMessage('Title must be a string'),
    body('iconId').optional().isUUID().withMessage('Icon ID must be a valid UUID'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validateRequest,
  propertyController.updateTextComponent
);

router.delete('/admin/:id/text-components/:componentId',
  authenticateJWT,
  propertyController.deleteTextComponent
);

router.put('/admin/:id/text-components/reorder',
  authenticateJWT,
  [
    body('componentIds').isArray().withMessage('Component IDs must be an array'),
    body('componentIds.*').isUUID().withMessage('Each component ID must be a valid UUID')
  ],
  validateRequest,
  propertyController.reorderTextComponents
);

// Video Testimonials routes
router.get('/admin/:id/video-testimonials',
  authenticateJWT,
  propertyController.getPropertyVideoTestimonials
);

router.post('/admin/:id/video-testimonials',
  authenticateJWT,
  [
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('testimonialText').notEmpty().withMessage('Testimonial text is required'),
    body('youtubeUrl').notEmpty().isURL().withMessage('Valid YouTube URL is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('designation').optional().isString().withMessage('Designation must be a string')
  ],
  validateRequest,
  propertyController.createVideoTestimonial
);

router.put('/admin/:id/video-testimonials/:testimonialId',
  authenticateJWT,
  [
    body('customerName').optional().notEmpty().withMessage('Customer name cannot be empty'),
    body('testimonialText').optional().notEmpty().withMessage('Testimonial text cannot be empty'),
    body('youtubeUrl').optional().isURL().withMessage('Valid YouTube URL is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('designation').optional().isString().withMessage('Designation must be a string'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validateRequest,
  propertyController.updateVideoTestimonial
);

router.delete('/admin/:id/video-testimonials/:testimonialId',
  authenticateJWT,
  propertyController.deleteVideoTestimonial
);

router.put('/admin/:id/video-testimonials/reorder',
  authenticateJWT,
  [
    body('testimonialOrder').isArray().withMessage('testimonialOrder must be an array'),
    body('testimonialOrder.*.id').isUUID().withMessage('Each testimonial must have a valid UUID'),
    body('testimonialOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.updateVideoTestimonialOrder
);

// Video Banner routes
router.get('/admin/:id/video-banner',
  authenticateJWT,
  propertyController.getPropertyVideoBanner
);

router.put('/admin/:id/video-banner',
  authenticateJWT,
  [
    body('videoBannerUrl').optional().isURL().withMessage('Valid video URL is required'),
    body('videoBannerTitle').optional().isString().withMessage('Video banner title must be a string'),
    body('videoBannerDescription').optional().isString().withMessage('Video banner description must be a string')
  ],
  validateRequest,
  propertyController.updatePropertyVideoBanner
);

router.delete('/admin/:id/video-banner',
  authenticateJWT,
  propertyController.deletePropertyVideoBanner
);

// FAQ routes
router.get('/admin/:id/faqs',
  authenticateJWT,
  propertyController.getPropertyFAQsAdmin
);

router.post('/admin/:id/faqs',
  authenticateJWT,
  [
    body('question').notEmpty().isLength({ min: 10, max: 1000 }).withMessage('Question must be between 10 and 1000 characters'),
    body('answer').notEmpty().isLength({ min: 10, max: 10000 }).withMessage('Answer must be between 10 and 10000 characters'),
    body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.createPropertyFAQ
);

router.put('/admin/:id/faqs/:faqId',
  authenticateJWT,
  [
    body('question').optional().isLength({ min: 10, max: 1000 }).withMessage('Question must be between 10 and 1000 characters'),
    body('answer').optional().isLength({ min: 10, max: 10000 }).withMessage('Answer must be between 10 and 10000 characters'),
    body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validateRequest,
  propertyController.updatePropertyFAQ
);

router.delete('/admin/:id/faqs/:faqId',
  authenticateJWT,
  propertyController.deletePropertyFAQ
);

router.put('/admin/:id/faqs/reorder',
  authenticateJWT,
  [
    body('faqOrder').isArray().withMessage('faqOrder must be an array'),
    body('faqOrder.*.id').isUUID().withMessage('Each FAQ must have a valid UUID'),
    body('faqOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.reorderPropertyFAQs
);

// Reviews routes (Admin)
router.get('/admin/:id/reviews',
  authenticateJWT,
  propertyController.getPropertyReviewsAdmin
);

router.post('/admin/:id/reviews',
  authenticateJWT,
  [
    body('customerName').notEmpty().isLength({ min: 2, max: 255 }).withMessage('Customer name must be between 2 and 255 characters'),
    body('designation').optional().isString().withMessage('Designation must be a string'),
    body('reviewText').notEmpty().isLength({ min: 10, max: 5000 }).withMessage('Review text must be between 10 and 5000 characters'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('customerPhotoAlt').optional().isString().withMessage('Customer photo alt text must be a string'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
  ],
  validateRequest,
  propertyController.createPropertyReview
);

router.put('/admin/:id/reviews/:reviewId',
  authenticateJWT,
  [
    body('customerName').optional().isLength({ min: 2, max: 255 }).withMessage('Customer name must be between 2 and 255 characters'),
    body('designation').optional().isString().withMessage('Designation must be a string'),
    body('reviewText').optional().isLength({ min: 10, max: 5000 }).withMessage('Review text must be between 10 and 5000 characters'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('customerPhotoAlt').optional().isString().withMessage('Customer photo alt text must be a string'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
  ],
  validateRequest,
  propertyController.updatePropertyReview
);

router.delete('/admin/:id/reviews/:reviewId',
  authenticateJWT,
  propertyController.deletePropertyReview
);

router.put('/admin/:id/reviews/reorder',
  authenticateJWT,
  [
    body('reviewOrder').isArray().withMessage('reviewOrder must be an array'),
    body('reviewOrder.*.id').isUUID().withMessage('Each review must have a valid UUID'),
    body('reviewOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.reorderPropertyReviews
);

router.post('/admin/:id/reviews/:reviewId/photo',
  authenticateJWT,
  upload.single('customerPhoto'),
  handleMulterErrors,
  [
    body('altText').optional().isString().withMessage('Alt text must be a string')
  ],
  validateRequest,
  propertyController.uploadReviewCustomerPhoto
);

// SEO Metadata routes
router.get('/admin/:id/seo',
  authenticateJWT,
  propertyController.getPropertySEOAdmin
);

router.put('/admin/:id/seo',
  authenticateJWT,
  [
    body('metaTitle').optional().isLength({ max: 255 }).withMessage('Meta title must be 255 characters or less'),
    body('metaDescription').optional().isLength({ max: 500 }).withMessage('Meta description must be 500 characters or less'),
    body('metaKeywords').optional().isLength({ max: 500 }).withMessage('Meta keywords must be 500 characters or less'),
    body('ogTitle').optional().isLength({ max: 255 }).withMessage('OG title must be 255 characters or less'),
    body('ogDescription').optional().isLength({ max: 500 }).withMessage('OG description must be 500 characters or less'),
    body('ogImage').optional().isLength({ max: 500 }).withMessage('OG image must be 500 characters or less'),
    body('ogUrl').optional().isLength({ max: 500 }).withMessage('OG URL must be 500 characters or less'),
    body('ogType').optional().isLength({ max: 50 }).withMessage('OG type must be 50 characters or less'),
    body('twitterTitle').optional().isLength({ max: 255 }).withMessage('Twitter title must be 255 characters or less'),
    body('twitterDescription').optional().isLength({ max: 500 }).withMessage('Twitter description must be 500 characters or less'),
    body('twitterImage').optional().isLength({ max: 500 }).withMessage('Twitter image must be 500 characters or less'),
    body('twitterCard').optional().isIn(['summary', 'summary_large_image', 'app', 'player']).withMessage('Invalid Twitter card type'),
    body('canonicalUrl').optional().isLength({ max: 500 }).withMessage('Canonical URL must be 500 characters or less'),
    body('robots').optional().isLength({ max: 100 }).withMessage('Robots directive must be 100 characters or less'),
    body('priority').optional().isFloat({ min: 0.0, max: 1.0 }).withMessage('Priority must be between 0.0 and 1.0'),
    body('changeFrequency').optional().isIn(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).withMessage('Invalid change frequency'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validateRequest,
  propertyController.updatePropertySEO
);

router.delete('/admin/:id/seo',
  authenticateJWT,
  propertyController.deletePropertySEO
);

// Client API routes (API Key authentication)
router.get('/',
  authenticateAPIKey,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('propertyType').optional().isUUID(),
    query('cityId').optional({ values: 'falsy' }).isUUID().withMessage('cityId must be a valid UUID'),
    query('areaId').optional({ values: 'falsy' }).isUUID().withMessage('areaId must be a valid UUID'),
    query('configurationId').optional({ values: 'falsy' }).isUUID().withMessage('configurationId must be a valid UUID'),
    query('priceRangeId').optional({ values: 'falsy' }).isUUID().withMessage('priceRangeId must be a valid UUID'),
    query('statusId').optional({ values: 'falsy' }).isUUID().withMessage('statusId must be a valid UUID')
  ],
  validateRequest,
  propertyController.getProperties
);

router.post('/',
  authenticateAPIKey,
  [
    body('page').optional().isInt({ min: 1 }),
    body('limit').optional().isInt({ min: 1, max: 100 }),
    body('propertyType').optional().isUUID(),
    body('searchTerm').optional({ values: 'falsy' }).isString().isLength({ max: 255 }).withMessage('searchTerm must be a string with max 255 characters'),
    body('filters').optional().isObject(),
    body('filters.cityId').optional({ values: 'falsy' }).isUUID().withMessage('cityId must be a valid UUID'),
    body('filters.areaId').optional({ values: 'falsy' }).isUUID().withMessage('areaId must be a valid UUID'),
    body('filters.configurationId').optional({ values: 'falsy' }).isUUID().withMessage('configurationId must be a valid UUID'),
    body('filters.priceRangeId').optional({ values: 'falsy' }).isUUID().withMessage('priceRangeId must be a valid UUID'),
    body('filters.statusId').optional({ values: 'falsy' }).isUUID().withMessage('statusId must be a valid UUID')
  ],
  validateRequest,
  propertyController.getPropertiesWithFilters
);

router.get('/:slug',
  authenticateAPIKey,
  propertyController.getPropertyBySlug
);

// Separate data endpoints for property details
router.get('/:slug/gallery',
  authenticateAPIKey,
  propertyController.getPropertyGallery
);

router.get('/:slug/images',
  authenticateAPIKey,
  [
    query('component_type').optional().isString().isLength({ max: 50 }).withMessage('Component type must be a string with max 50 characters')
  ],
  validateRequest,
  propertyController.getPropertyImages
);

router.get('/:slug/amenities',
  authenticateAPIKey,
  propertyController.getPropertyAmenities
);

router.get('/:slug/location-highlights',
  authenticateAPIKey,
  propertyController.getPropertyLocationHighlights
);

router.get('/:slug/overview-highlights',
  authenticateAPIKey,
  propertyController.getPropertyOverviewHighlights
);

router.get('/:slug/testimonials',
  authenticateAPIKey,
  propertyController.getPropertyTestimonials
);

router.get('/:slug/faqs',
  authenticateAPIKey,
  propertyController.getPropertyFAQs
);

router.get('/:slug/seo',
  authenticateAPIKey,
  propertyController.getPropertySEO
);

router.get('/:slug/videos',
  authenticateAPIKey,
  propertyController.getPropertyVideosBySlug
);

router.get('/:slug/reviews',
  authenticateAPIKey,
  propertyController.getPropertyReviewsBySlug
);

router.get('/:slug/work-in-progress',
  authenticateAPIKey,
  propertyController.getPropertyWorkInProgressBySlug
);

router.get('/:slug/recommendations',
  authenticateAPIKey,
  propertyController.getPropertyRecommendationsBySlug
);

router.get('/:slug/custom-fields',
  authenticateAPIKey,
  propertyController.getPropertyCustomFieldsBySlug
);

// Progress Images routes
router.get('/admin/:id/progress-images',
  authenticateJWT,
  [
    query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100'),
    query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12')
  ],
  validateRequest,
  propertyController.getPropertyProgressImages
);

router.post('/admin/:id/progress-images/upload',
  authenticateJWT,
  upload.array('images', 20), // Allow up to 20 images
  handleMulterErrors,
  [
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12')
  ],
  validateRequest,
  propertyController.uploadPropertyProgressImages
);

router.put('/admin/:id/progress-images/:imageId',
  authenticateJWT,
  [
    body('alt').optional().isString().withMessage('Alt text must be a string'),
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validateRequest,
  propertyController.updatePropertyProgressImage
);

router.delete('/admin/:id/progress-images/:imageId',
  authenticateJWT,
  propertyController.deletePropertyProgressImage
);

router.put('/admin/:id/progress-images/reorder',
  authenticateJWT,
  [
    body('imageOrder').isArray().withMessage('imageOrder must be an array'),
    body('imageOrder.*.id').isUUID().withMessage('Each image must have a valid UUID'),
    body('imageOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.reorderPropertyProgressImages
);

// Property Recommendations routes
router.get('/admin/:id/recommendations',
  authenticateJWT,
  propertyController.getPropertyRecommendations
);

router.post('/admin/:id/recommendations',
  authenticateJWT,
  [
    body('recommendedPropertyId').isUUID().withMessage('Recommended property ID must be a valid UUID'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
  ],
  validateRequest,
  propertyController.addPropertyRecommendation
);

router.delete('/admin/:id/recommendations/:recommendationId',
  authenticateJWT,
  propertyController.removePropertyRecommendation
);

router.put('/admin/:id/recommendations/reorder',
  authenticateJWT,
  [
    body('recommendationOrder').isArray().withMessage('recommendationOrder must be an array'),
    body('recommendationOrder.*.id').isUUID().withMessage('Each recommendation must have a valid UUID'),
    body('recommendationOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.reorderPropertyRecommendations
);

// Custom Fields routes
router.get('/admin/:id/custom-fields',
  authenticateJWT,
  propertyController.getPropertyCustomFields
);

router.post('/admin/:id/custom-fields',
  authenticateJWT,
  [
    body('fieldKeyId').notEmpty().isUUID().withMessage('Valid field key ID is required'),
    body('fieldValue').notEmpty().trim().withMessage('Field value is required')
  ],
  validateRequest,
  propertyController.addPropertyCustomField
);

router.put('/admin/:id/custom-fields/:fieldId',
  authenticateJWT,
  [
    body('fieldValue').notEmpty().trim().withMessage('Field value is required')
  ],
  validateRequest,
  propertyController.updatePropertyCustomField
);

router.delete('/admin/:id/custom-fields/:fieldId',
  authenticateJWT,
  propertyController.deletePropertyCustomField
);

router.put('/admin/:id/custom-fields/order',
  authenticateJWT,
  [
    body('fieldOrder').isArray().withMessage('fieldOrder must be an array'),
    body('fieldOrder.*.id').isUUID().withMessage('Each item must have a valid UUID id'),
    body('fieldOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  propertyController.updatePropertyCustomFieldsOrder
);

export default router;