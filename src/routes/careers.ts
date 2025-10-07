import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { CareerJobController } from '../controllers/CareerJobController';
import { authenticateJWT, authenticateAPIKey } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const careerJobController = new CareerJobController();

// Custom validator for nullable UUID fields
const nullableUUID = (fieldName: string) => {
  return body(fieldName).custom((value) => {
    // Allow null, undefined, or empty string
    if (value === null || value === undefined || value === '') {
      return true;
    }
    
    // If value exists, it must be a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error(`${fieldName} must be a valid UUID or null`);
    }
    return true;
  });
};

// Custom validator for nullable numbers
const nullableNumber = (fieldName: string, min: number = 0) => {
  return body(fieldName).custom((value) => {
    // Allow null, undefined, or empty string
    if (value === null || value === undefined || value === '') {
      return true;
    }
    
    // If value exists, it must be a valid number
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < min) {
      throw new Error(`${fieldName} must be a number >= ${min} or null`);
    }
    return true;
  });
};

// Custom validator for nullable dates
const nullableDate = (fieldName: string) => {
  return body(fieldName).custom((value) => {
    // Allow null, undefined, or empty string
    if (value === null || value === undefined || value === '') {
      return true;
    }
    
    // If value exists, it must be a valid ISO8601 date
    if (isNaN(Date.parse(value))) {
      throw new Error(`${fieldName} must be a valid date or null`);
    }
    return true;
  });
};

// Admin routes (JWT authentication)
router.get('/admin',
  authenticateJWT,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('isActive').optional().isBoolean(),
    query('isFeatured').optional().isBoolean(),
    query('departmentId').optional().isUUID(),
    query('jobTypeId').optional().isUUID(),
    query('cityId').optional().isUUID()
  ],
  validateRequest,
  careerJobController.getJobsAdmin
);

router.get('/admin/:id',
  authenticateJWT,
  [
    param('id').isUUID()
  ],
  validateRequest,
  careerJobController.getJobAdmin
);

router.post('/admin',
  authenticateJWT,
  [
    body('title').notEmpty().isLength({ min: 2, max: 255 }).withMessage('Title must be between 2 and 255 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('requirements').optional().isArray().withMessage('Requirements must be an array'),
    body('requirements.*').optional().isString().withMessage('Each requirement must be a string'),
    body('responsibilities').optional().isArray().withMessage('Responsibilities must be an array'),
    body('responsibilities.*').optional().isString().withMessage('Each responsibility must be a string'),
    nullableUUID('departmentId'),
    body('jobTypeId').isUUID().withMessage('Job Type ID is required and must be a valid UUID'),
    body('cityId').isUUID().withMessage('City ID is required and must be a valid UUID'),
    nullableUUID('areaId'),
    body('experienceMin').isInt({ min: 0 }).withMessage('Minimum experience is required and must be a non-negative integer'),
    body('experienceMax').isInt({ min: 0 }).withMessage('Maximum experience is required and must be a non-negative integer'),
    nullableNumber('salaryMin'),
    nullableNumber('salaryMax'),
    body('isActive').isBoolean().withMessage('isActive is required and must be a boolean'),
    body('isFeatured').isBoolean().withMessage('isFeatured is required and must be a boolean'),
    body('postedDate').isISO8601().withMessage('Posted date is required and must be a valid date'),
    nullableDate('closingDate'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
  ],
  validateRequest,
  careerJobController.createJob
);

router.put('/admin/:id',
  authenticateJWT,
  [
    param('id').isUUID(),
    body('title').optional().isLength({ min: 2, max: 255 }).withMessage('Title must be between 2 and 255 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('requirements').optional().isArray().withMessage('Requirements must be an array'),
    body('requirements.*').optional().isString().withMessage('Each requirement must be a string'),
    body('responsibilities').optional().isArray().withMessage('Responsibilities must be an array'),
    body('responsibilities.*').optional().isString().withMessage('Each responsibility must be a string'),
    nullableUUID('departmentId'),
    nullableUUID('jobTypeId'),
    nullableUUID('cityId'),
    nullableUUID('areaId'),
    nullableNumber('experienceMin'),
    nullableNumber('experienceMax'),
    nullableNumber('salaryMin'),
    nullableNumber('salaryMax'),
    body('isActive').optional().isBoolean(),
    body('isFeatured').optional().isBoolean(),
    nullableDate('postedDate'),
    nullableDate('closingDate'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
  ],
  validateRequest,
  careerJobController.updateJob
);

router.delete('/admin/:id',
  authenticateJWT,
  [
    param('id').isUUID()
  ],
  validateRequest,
  careerJobController.deleteJob
);

router.put('/admin/reorder',
  authenticateJWT,
  [
    body('jobOrder').isArray().withMessage('jobOrder must be an array'),
    body('jobOrder.*.id').isUUID().withMessage('Each job must have a valid UUID'),
    body('jobOrder.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder must be a non-negative integer')
  ],
  validateRequest,
  careerJobController.reorderJobs
);

// Public API routes (API Key authentication)
router.get('/',
  authenticateAPIKey,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('departmentId').optional().isUUID(),
    query('jobTypeId').optional().isUUID(),
    query('cityId').optional().isUUID(),
    query('areaId').optional().isUUID(),
    query('experienceMin').optional().isInt({ min: 0 }),
    query('experienceMax').optional().isInt({ min: 0 })
  ],
  validateRequest,
  careerJobController.getJobs
);

router.get('/:slug',
  authenticateAPIKey,
  [
    param('slug').notEmpty().isString()
  ],
  validateRequest,
  careerJobController.getJobBySlug
);

router.post('/search',
  authenticateAPIKey,
  [
    body('page').optional().isInt({ min: 1 }),
    body('limit').optional().isInt({ min: 1, max: 100 }),
    body('keyword').optional().isString(),
    body('filters').optional().isObject(),
    body('filters.departmentId').optional().isUUID(),
    body('filters.jobTypeId').optional().isUUID(),
    body('filters.cityId').optional().isUUID(),
    body('filters.areaId').optional().isUUID(),
    body('filters.experienceMin').optional().isInt({ min: 0 }),
    body('filters.experienceMax').optional().isInt({ min: 0 })
  ],
  validateRequest,
  careerJobController.searchJobs
);

export default router;