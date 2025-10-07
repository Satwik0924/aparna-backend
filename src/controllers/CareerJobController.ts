import { Response } from 'express';
import { Op } from 'sequelize';
import CareerJob from '../models/CareerJob';
import DropdownValue from '../models/DropdownValue';
import DropdownCategory from '../models/DropdownCategory';
import { AuthRequest } from '../middleware/auth';
import { uploadFile, deleteFile } from '../utils/digitalOceanSpaces';

export class CareerJobController {
  // Standard includes for career job queries
  private static readonly STANDARD_INCLUDES = [
    { association: 'department', attributes: ['id', 'value', 'slug'] },
    { association: 'jobType', attributes: ['id', 'value', 'slug'] },
    { association: 'cityDropdown', attributes: ['id', 'value', 'slug'] },
    { association: 'areaDropdown', attributes: ['id', 'value', 'slug'] }
  ];
 
  // Validate mandatory fields for job creation
  private static validateMandatoryFields(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check mandatory fields
    if (!data.title || data.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!data.description || data.description.trim() === '') {
      errors.push('Description is required');
    }

    if (!Array.isArray(data.requirements)) {
      errors.push('Requirements must be an array');
    } else if (data.requirements.length === 0) {
      errors.push('Requirements cannot be empty');
    }

    if (data.responsibilities !== undefined && !Array.isArray(data.responsibilities)) {
      errors.push('Responsibilities must be an array if provided');
    }

    if (!data.jobTypeId || data.jobTypeId.trim() === '') {
      errors.push('Job Type is required');
    }

    if (!data.cityId || data.cityId.trim() === '') {
      errors.push('City is required');
    }

    if (data.experienceMin === undefined || data.experienceMin === null) {
      errors.push('Minimum experience is required');
    } else if (typeof data.experienceMin !== 'number' || data.experienceMin < 0) {
      errors.push('Minimum experience must be a non-negative number');
    }

    if (data.experienceMax === undefined || data.experienceMax === null) {
      errors.push('Maximum experience is required');
    } else if (typeof data.experienceMax !== 'number' || data.experienceMax < 0) {
      errors.push('Maximum experience must be a non-negative number');
    }

    if (data.experienceMin !== undefined && data.experienceMax !== undefined && 
        data.experienceMax < data.experienceMin) {
      errors.push('Maximum experience must be greater than or equal to minimum experience');
    }

    if (data.isActive === undefined || data.isActive === null || typeof data.isActive !== 'boolean') {
      errors.push('isActive must be a boolean value');
    }

    if (data.isFeatured === undefined || data.isFeatured === null || typeof data.isFeatured !== 'boolean') {
      errors.push('isFeatured must be a boolean value');
    }

    if (!data.postedDate) {
      errors.push('Posted date is required');
    }

    // Validate optional fields if provided
    if (data.salaryMin !== null && data.salaryMin !== undefined && 
        (typeof data.salaryMin !== 'number' || data.salaryMin < 0)) {
      errors.push('Minimum salary must be a non-negative number if provided');
    }

    if (data.salaryMax !== null && data.salaryMax !== undefined && 
        (typeof data.salaryMax !== 'number' || data.salaryMax < 0)) {
      errors.push('Maximum salary must be a non-negative number if provided');
    }

    if (data.salaryMin && data.salaryMax && data.salaryMax < data.salaryMin) {
      errors.push('Maximum salary must be greater than or equal to minimum salary');
    }

    if (data.closingDate && new Date(data.closingDate) <= new Date()) {
      errors.push('Closing date must be in the future');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate fields for job update (more flexible than create)
  private static validateUpdateFields(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Title validation
    if (data.title !== undefined) {
      if (!data.title || data.title.trim() === '') {
        errors.push('Title cannot be empty');
      } else if (data.title.length < 2 || data.title.length > 255) {
        errors.push('Title must be between 2 and 255 characters');
      }
    }

    // Description validation
    if (data.description !== undefined) {
      if (!data.description || data.description.trim() === '') {
        errors.push('Description cannot be empty');
      }
    }

    // Requirements validation
    if (data.requirements !== undefined) {
      if (!Array.isArray(data.requirements)) {
        errors.push('Requirements must be an array');
      } else if (data.requirements.length === 0) {
        errors.push('Requirements cannot be empty');
      } else {
        // Check each requirement is a non-empty string
        data.requirements.forEach((req: any, index: number) => {
          if (typeof req !== 'string' || req.trim() === '') {
            errors.push(`Requirement at index ${index} must be a non-empty string`);
          }
        });
      }
    }

    // Responsibilities validation
    if (data.responsibilities !== undefined) {
      if (!Array.isArray(data.responsibilities)) {
        errors.push('Responsibilities must be an array if provided');
      } else {
        // Check each responsibility is a non-empty string
        data.responsibilities.forEach((resp: any, index: number) => {
          if (typeof resp !== 'string' || resp.trim() === '') {
            errors.push(`Responsibility at index ${index} must be a non-empty string`);
          }
        });
      }
    }

    // Job Type validation
    if (data.jobTypeId !== undefined) {
      if (!data.jobTypeId || data.jobTypeId.trim() === '') {
        errors.push('Job Type cannot be empty');
      }
    }

    // City validation
    if (data.cityId !== undefined) {
      if (!data.cityId || data.cityId.trim() === '') {
        errors.push('City cannot be empty');
      }
    }

    // Experience validation
    if (data.experienceMin !== undefined) {
      if (data.experienceMin === null || data.experienceMin === '') {
        errors.push('Minimum experience cannot be empty');
      } else if (typeof data.experienceMin !== 'number' || data.experienceMin < 0) {
        errors.push('Minimum experience must be a non-negative number');
      }
    }

    if (data.experienceMax !== undefined) {
      if (data.experienceMax === null || data.experienceMax === '') {
        errors.push('Maximum experience cannot be empty');
      } else if (typeof data.experienceMax !== 'number' || data.experienceMax < 0) {
        errors.push('Maximum experience must be a non-negative number');
      }
    }

    // Check experience range if both are provided
    if (data.experienceMin !== undefined && data.experienceMax !== undefined && 
        data.experienceMin !== null && data.experienceMax !== null &&
        data.experienceMax < data.experienceMin) {
      errors.push('Maximum experience must be greater than or equal to minimum experience');
    }

    // Boolean validations
    if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
      errors.push('isActive must be a boolean value');
    }

    if (data.isFeatured !== undefined && typeof data.isFeatured !== 'boolean') {
      errors.push('isFeatured must be a boolean value');
    }

    // Date validations
    if (data.postedDate !== undefined) {
      if (!data.postedDate) {
        errors.push('Posted date cannot be empty');
      } else if (isNaN(Date.parse(data.postedDate))) {
        errors.push('Posted date must be a valid date');
      }
    }

    if (data.closingDate !== undefined && data.closingDate !== null && data.closingDate !== '') {
      if (isNaN(Date.parse(data.closingDate))) {
        errors.push('Closing date must be a valid date');
      } else if (new Date(data.closingDate) <= new Date()) {
        errors.push('Closing date must be in the future');
      }
    }

    // Salary validations
    if (data.salaryMin !== undefined && data.salaryMin !== null && data.salaryMin !== '') {
      if (typeof data.salaryMin !== 'number' || data.salaryMin < 0) {
        errors.push('Minimum salary must be a non-negative number if provided');
      }
    }

    if (data.salaryMax !== undefined && data.salaryMax !== null && data.salaryMax !== '') {
      if (typeof data.salaryMax !== 'number' || data.salaryMax < 0) {
        errors.push('Maximum salary must be a non-negative number if provided');
      }
    }

    // Check salary range if both are provided
    if (data.salaryMin !== undefined && data.salaryMax !== undefined && 
        data.salaryMin !== null && data.salaryMax !== null &&
        data.salaryMin !== '' && data.salaryMax !== '' &&
        data.salaryMax < data.salaryMin) {
      errors.push('Maximum salary must be greater than or equal to minimum salary');
    }

    // Sort order validation
    if (data.sortOrder !== undefined) {
      if (typeof data.sortOrder !== 'number' || data.sortOrder < 0) {
        errors.push('Sort order must be a non-negative number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Admin endpoints
  async getJobsAdmin(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10, isActive, isFeatured, departmentId, jobTypeId, cityId } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {
        clientId: req.user!.clientId
      };

      // Apply filters
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
      if (departmentId) where.departmentId = departmentId;
      if (jobTypeId) where.jobTypeId = jobTypeId;
      if (cityId) where.cityId = cityId;

      const { count, rows: jobs } = await CareerJob.findAndCountAll({
        where,
        include: CareerJobController.STANDARD_INCLUDES,
        limit: Number(limit),
        offset,
        order: [['sortOrder', 'ASC'], ['postedDate', 'DESC']],
        distinct: true
      });

      res.json({
        success: true,
        data: jobs,
        pagination: {
          total: count,
          page: Number(page),
          pages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ success: false, message: 'Error fetching jobs' });
    }
  }

  async getJobAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const job = await CareerJob.findOne({
        where: {
          id,
          clientId: req.user!.clientId
        },
        include: CareerJobController.STANDARD_INCLUDES
      });

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      res.json({ success: true, data: job });
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({ success: false, message: 'Error fetching job' });
    }
  }

  async createJob(req: AuthRequest, res: Response) {
    try {
      // Validate mandatory fields
      const validation = CareerJobController.validateMandatoryFields(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Prepare job data with proper defaults for optional fields
      const jobData = {
        ...req.body,
        clientId: req.user!.clientId,
        postedDate: req.body.postedDate || new Date(),
        // Set default empty array for responsibilities if not provided
        responsibilities: req.body.responsibilities || [],
        // Handle optional fields - set to null if empty string or undefined
        departmentId: req.body.departmentId && req.body.departmentId.trim() !== '' ? req.body.departmentId : null,
        areaId: req.body.areaId && req.body.areaId.trim() !== '' ? req.body.areaId : null,
        salaryMin: req.body.salaryMin !== undefined && req.body.salaryMin !== '' ? req.body.salaryMin : null,
        salaryMax: req.body.salaryMax !== undefined && req.body.salaryMax !== '' ? req.body.salaryMax : null,
        closingDate: req.body.closingDate && req.body.closingDate.trim() !== '' ? req.body.closingDate : null
      };

      const job = await CareerJob.create(jobData);
      
      // Fetch with associations
      const jobWithAssociations = await CareerJob.findByPk(job.id, {
        include: CareerJobController.STANDARD_INCLUDES
      });

      res.status(201).json({
        success: true,
        data: jobWithAssociations,
        message: 'Job created successfully'
      });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating job',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateJob(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const job = await CareerJob.findOne({
        where: {
          id,
          clientId: req.user!.clientId
        }
      });

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      // Validate update fields
      const validation = CareerJobController.validateUpdateFields(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Check if no fields are provided for update
      const updateKeys = Object.keys(req.body);
      if (updateKeys.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields provided for update'
        });
      }

      // Prepare update data
      const updateData = { ...req.body };
      
      // Handle optional fields - set to null if empty string
      if (updateData.departmentId !== undefined) {
        updateData.departmentId = updateData.departmentId && updateData.departmentId.trim() !== '' ? updateData.departmentId : null;
      }
      if (updateData.areaId !== undefined) {
        updateData.areaId = updateData.areaId && updateData.areaId.trim() !== '' ? updateData.areaId : null;
      }
      if (updateData.salaryMin !== undefined) {
        updateData.salaryMin = updateData.salaryMin !== '' ? updateData.salaryMin : null;
      }
      if (updateData.salaryMax !== undefined) {
        updateData.salaryMax = updateData.salaryMax !== '' ? updateData.salaryMax : null;
      }
      if (updateData.closingDate !== undefined) {
        updateData.closingDate = updateData.closingDate && updateData.closingDate.trim() !== '' ? updateData.closingDate : null;
      }

      await job.update(updateData);

      // Fetch with associations
      const updatedJob = await CareerJob.findByPk(job.id, {
        include: CareerJobController.STANDARD_INCLUDES
      });

      res.json({
        success: true,
        data: updatedJob,
        message: 'Job updated successfully'
      });
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating job',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteJob(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const job = await CareerJob.findOne({
        where: {
          id,
          clientId: req.user!.clientId
        }
      });

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      await job.destroy();

      res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ success: false, message: 'Error deleting job' });
    }
  }

  async reorderJobs(req: AuthRequest, res: Response) {
    try {
      const { jobOrder } = req.body;

      // Update sort order for each job
      const updatePromises = jobOrder.map((item: { id: string; sortOrder: number }) =>
        CareerJob.update(
          { sortOrder: item.sortOrder },
          { 
            where: { 
              id: item.id,
              clientId: req.user!.clientId
            } 
          }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Jobs reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering jobs:', error);
      res.status(500).json({ success: false, message: 'Error reordering jobs' });
    }
  }

  // Public API endpoints
  async getJobs(req: AuthRequest, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        departmentId, 
        jobTypeId, 
        cityId, 
        areaId,
        experienceMin,
        experienceMax
      } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {
        clientId: req.client!.id,
        isActive: true,
        [Op.or]: [
          { closingDate: null },
          { closingDate: { [Op.gte]: new Date() } }
        ]
      };

      // Apply filters
      if (departmentId) where.departmentId = departmentId;
      if (jobTypeId) where.jobTypeId = jobTypeId;
      if (cityId) where.cityId = cityId;
      if (areaId) where.areaId = areaId;
      
      // Experience filter
      if (experienceMin || experienceMax) {
        where[Op.and] = where[Op.and] || [];
        
        if (experienceMin) {
          where[Op.and].push({
            [Op.or]: [
              { experienceMax: { [Op.gte]: Number(experienceMin) } },
              { experienceMax: null }
            ]
          });
        }
        
        if (experienceMax) {
          where[Op.and].push({
            experienceMin: { [Op.lte]: Number(experienceMax) }
          });
        }
      }

      const { count, rows: jobs } = await CareerJob.findAndCountAll({
        where,
        include: CareerJobController.STANDARD_INCLUDES,
        attributes: {
          exclude: ['salaryMin', 'salaryMax'] // Exclude sensitive info
        },
        limit: Number(limit),
        offset,
        order: [
          ['isFeatured', 'DESC'],
          ['sortOrder', 'ASC'],
          ['postedDate', 'DESC']
        ],
        distinct: true
      });

      // Format jobs for API response
      const formattedJobs = jobs.map(job => ({
        id: job.id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        requirements: job.requirements,
        department: job.department,
        jobType: job.jobType,
        cityDropdown: job.cityDropdown,
        areaDropdown: job.areaDropdown,
        experienceRange: job.getExperienceRange(),
        postedDate: job.postedDate,
        closingDate: job.closingDate,
        isFeatured: job.isFeatured,
        isExpired: job.isExpired()
      }));

      res.json({
        success: true,
        data: formattedJobs,
        pagination: {
          total: count,
          page: Number(page),
          pages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ success: false, message: 'Error fetching jobs' });
    }
  }

  async getJobBySlug(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;

      const job = await CareerJob.findOne({
        where: {
          slug,
          clientId: req.client!.id,
          isActive: true
        },
        include: CareerJobController.STANDARD_INCLUDES
      });

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      // Check if expired
      if (job.isExpired()) {
        return res.status(404).json({ success: false, message: 'This job posting has expired' });
      }

      // Format job for API response
      const formattedJob = {
        id: job.id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        department: job.department,
        jobType: job.jobType,
        cityDropdown: job.cityDropdown,
        areaDropdown: job.areaDropdown,
        experienceRange: job.getExperienceRange(),
        postedDate: job.postedDate,
        closingDate: job.closingDate,
        isFeatured: job.isFeatured
      };

      res.json({
        success: true,
        data: formattedJob
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({ success: false, message: 'Error fetching job' });
    }
  }

  async searchJobs(req: AuthRequest, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10,
        keyword,
        filters = {}
      } = req.body;
      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {
        clientId: req.client!.id,
        isActive: true,
        [Op.or]: [
          { closingDate: null },
          { closingDate: { [Op.gte]: new Date() } }
        ]
      };

      // Keyword search
      if (keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // Apply filters
      const { departmentId, jobTypeId, cityId, areaId, experienceMin, experienceMax } = filters;
      
      if (departmentId) where.departmentId = departmentId;
      if (jobTypeId) where.jobTypeId = jobTypeId;
      if (cityId) where.cityId = cityId;
      if (areaId) where.areaId = areaId;

      // Experience filter
      if (experienceMin || experienceMax) {
        where[Op.and] = where[Op.and] || [];
        
        if (experienceMin) {
          where[Op.and].push({
            [Op.or]: [
              { experienceMax: { [Op.gte]: Number(experienceMin) } },
              { experienceMax: null }
            ]
          });
        }
        
        if (experienceMax) {
          where[Op.and].push({
            experienceMin: { [Op.lte]: Number(experienceMax) }
          });
        }
      }

      const { count, rows: jobs } = await CareerJob.findAndCountAll({
        where,
        include: CareerJobController.STANDARD_INCLUDES,
        attributes: {
          exclude: ['salaryMin', 'salaryMax']
        },
        limit: Number(limit),
        offset,
        order: [
          ['isFeatured', 'DESC'],
          ['sortOrder', 'ASC'],
          ['postedDate', 'DESC']
        ],
        distinct: true
      });

      // Format jobs for API response
      const formattedJobs = jobs.map(job => ({
        id: job.id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        requirements: job.requirements,
        department: job.department,
        jobType: job.jobType,
        cityDropdown: job.cityDropdown,
        areaDropdown: job.areaDropdown,
        experienceRange: job.getExperienceRange(),
        postedDate: job.postedDate,
        closingDate: job.closingDate,
        isFeatured: job.isFeatured,
        isExpired: job.isExpired()
      }));

      res.json({
        success: true,
        data: formattedJobs,
        pagination: {
          total: count,
          page: Number(page),
          pages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error searching jobs:', error);
      res.status(500).json({ success: false, message: 'Error searching jobs' });
    }
  }
}