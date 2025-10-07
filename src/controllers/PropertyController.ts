import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Property from '../models/Property';
import { AuthRequest } from '../middleware/auth';
import slugify from 'slugify';
import { PropertyService } from '../services/PropertyService';
import DropdownValue from '../models/DropdownValue';
import DropdownCategory from '../models/DropdownCategory';
import { uploadPropertyBanner, createProjectFolder, deleteProjectFolder, uploadFile, MediaFolder, uploadFiles } from '../utils/digitalOceanSpaces';
import CacheService from '../utils/cache';
import PropertyImage from '../models/PropertyImage';
import PropertyFloorPlan from '../models/PropertyFloorPlan';
import PropertyLayout from '../models/PropertyLayout';
import PropertyLocationHighlight from '../models/PropertyLocationHighlight';
import PropertyAmenitiesHighlight from '../models/PropertyAmenitiesHighlight';
import PropertyCustomField from '../models/PropertyCustomField';
import PropertyOverviewHighlight from '../models/PropertyOverviewHighlight';
import PropertyTextComponent from '../models/PropertyTextComponent';
import PropertyVideoTestimonial from '../models/PropertyVideoTestimonial';
import { PropertyReview } from '../models/PropertyReview';
import PropertyProgressImage from '../models/PropertyProgressImage';
import PropertyRecommendation from '../models/PropertyRecommendation';
import { PropertyConfiguration } from '../models/PropertyConfiguration';
import { PropertyPriceRange } from '../models/PropertyPriceRange';
import MediaFile from '../models/MediaFile';
import Faq from '../models/Faq';
import FaqCategory from '../models/FaqCategory';
import SeoMetadata from '../models/SeoMetadata';
import { sequelize } from '../utils/database';

export class PropertyController {


  // Admin methods
  async getPropertiesAdmin(req: AuthRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 50,
        propertyType
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      
      // Add client filter if user is not super admin
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      // Filter by property type if provided
      if (propertyType) {
        where.propertyTypeId = propertyType;
      }

      const { count, rows } = await Property.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        attributes: [
          'id',
          'name',
          'reraNumber',
          'propertyTypeId',
          'bannerDesktopUrl',
          'bannerMobileUrl',
          'bannerDesktopAlt',
          'bannerMobileAlt',
          'basicSectionData',
          'basicDynamicFields',
          'sortOrder',
          'sellDoProjectId',
          'created_at'
        ],
        include: [
          { 
            association: 'propertyType',
            attributes: ['id', 'value', 'slug']
          }
        ]
      });

      // Format the response
      const formattedProperties = rows.map(property => ({
        id: property.id,
        name: property.name,
        reraNumber: property.reraNumber,
        propertyType: property.propertyType,
        bannerDesktopUrl: property.bannerDesktopUrl,
        bannerMobileUrl: property.bannerMobileUrl,
        bannerDesktopAlt: property.bannerDesktopAlt,
        bannerMobileAlt: property.bannerMobileAlt,
        basicSectionData: property.basicSectionData,
        basicDynamicFields: property.basicDynamicFields,
        sortOrder: property.sortOrder,
        sellDoProjectId: property.sellDoProjectId,
        createdAt: property.createdAt
      }));

      res.json({
        success: true,
        data: {
          properties: formattedProperties,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching admin properties:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch properties'
      });
    }
  }

  async getPropertiesAdminWithFilters(req: AuthRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        propertyType,
        filters = {}
      } = req.body;

      const offset = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      
      // Add client filter if user is not super admin
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      // Filter by property type if provided
      if (propertyType) {
        where.propertyTypeId = propertyType;
      }

      // Apply additional filters from filters object
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          where[key] = filters[key];
        }
      });

      const { count, rows } = await Property.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        attributes: [
          'id',
          'name',
          'reraNumber',
          'propertyTypeId',
          'bannerDesktopUrl',
          'bannerMobileUrl',
          'bannerDesktopAlt',
          'bannerMobileAlt',
          'basicSectionData',
          'basicDynamicFields',
          'sortOrder',
          'sellDoProjectId'
        ],
        include: [
          { 
            association: 'propertyType',
            attributes: ['id', 'value', 'slug']
          }
        ]
      });

      // Format the response
      const formattedProperties = rows.map(property => ({
        id: property.id,
        name: property.name,
        reraNumber: property.reraNumber,
        propertyType: property.propertyType,
        bannerDesktopUrl: property.bannerDesktopUrl,
        bannerMobileUrl: property.bannerMobileUrl,
        bannerDesktopAlt: property.bannerDesktopAlt,
        bannerMobileAlt: property.bannerMobileAlt,
        basicSectionData: property.basicSectionData,
        basicDynamicFields: property.basicDynamicFields,
        sortOrder: property.sortOrder,
        sellDoProjectId: property.sellDoProjectId
      }));

      res.json({
        success: true,
        data: {
          properties: formattedProperties,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count / Number(limit))
          },
          appliedFilters: filters
        }
      });
    } catch (error) {
      console.error('Error fetching admin properties with filters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch properties'
      });
    }
  }

  async getPropertyAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({
        where,
        include: [
          {
            model: DropdownValue,
            as: 'configurations',
            attributes: ['id', 'value']
          },
          {
            model: DropdownValue,
            as: 'priceRanges',
            attributes: ['id', 'value']
          }
        ]
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      res.json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch property',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createProperty(req: AuthRequest, res: Response) {
    try {
      const { name, description, propertyType } = req.body;

      // Validate required fields
      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Property name is required'
        });
      }

      // Get propertyTypeId from dropdown if propertyType is provided
      let propertyTypeId = null;
      if (propertyType) {
        try {
          // First get the property_types category
          const propertyTypesCategory = await DropdownCategory.findOne({
            where: { name: 'property_types' }
          });

          if (propertyTypesCategory) {
            // Look up the dropdown value by slug (e.g., 'apartments' -> 'apartment')
            const propertyTypeSlug = propertyType.toLowerCase().replace(/s$/, ''); // Remove trailing 's'
            const dropdownValue = await DropdownValue.findOne({
              where: {
                categoryId: propertyTypesCategory.id,
                slug: propertyTypeSlug,
                isActive: true
              }
            });

            if (dropdownValue) {
              propertyTypeId = dropdownValue.id;
            } else {
              console.log(`Property type '${propertyType}' not found in dropdown values`);
            }
          }
        } catch (error) {
          console.error('Error looking up property type:', error);
        }
      }

      // Get clientId from user (admin users have clientId, super admins might not)
      const clientId = req.user?.clientId || req.body.clientId || 'default-client-id';
      
      console.log('Creating property with clientId:', clientId);
      console.log('User info:', { id: req.user?.id, clientId: req.user?.clientId });

      // Generate slug manually since hooks might not be working
      const baseSlug = slugify(name.trim(), { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug uniqueness
      while (true) {
        const existingProperty = await Property.findOne({
          where: { slug, clientId }
        });
        
        if (!existingProperty) break;
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create property with minimal required data
      const propertyData = {
        name: name.trim(),
        slug, // Add the generated slug
        description: description?.trim() || '',
        propertyTypeId: propertyTypeId || undefined,
        clientId,
        // Set defaults for required fields
        price: 0,
        priceType: 'fixed' as const,
        currency: 'INR',
        address: '',
        city: '',
        state: '',
        country: '',
        area: 0,
        areaUnit: 'sq_ft' as const,
        featured: false,
        isActive: true,
        viewCount: 0,
        inquiryCount: 0
      };

      console.log('Property data before creation:', propertyData);

      const property = await Property.create(propertyData);

      // Create project folder structure in Digital Ocean Spaces
      try {
        await createProjectFolder(property.id);
        console.log(`✅ Project folder created for property: ${property.id}`);
      } catch (error) {
        console.error('Failed to create project folder, but property was created:', error);
        // Don't fail the entire operation if folder creation fails
      }

      res.status(201).json({
        success: true,
        message: 'Property created successfully',
        data: property
      });
    } catch (error) {
      console.error('Property creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create property'
      });
    }
  }

  async updateProperty(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { configurationIds, priceRangeIds, ...updateData } = req.body;
      
      const where: any = { id };
      
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Update property basic fields
      await property.update(updateData);

      // Handle configuration updates if provided
      if (configurationIds !== undefined) {
        // Remove all existing configurations
        await PropertyConfiguration.destroy({
          where: { propertyId: property.id }
        });

        // Add new configurations if any
        if (Array.isArray(configurationIds) && configurationIds.length > 0) {
          const configurationData = configurationIds.map(configId => ({
            propertyId: property.id,
            configurationId: configId
          }));
          
          await PropertyConfiguration.bulkCreate(configurationData);
        }
      }

      // Handle price range updates if provided
      if (priceRangeIds !== undefined) {
        // Remove all existing price ranges
        await PropertyPriceRange.destroy({
          where: { propertyId: property.id }
        });

        // Add new price ranges if any
        if (Array.isArray(priceRangeIds) && priceRangeIds.length > 0) {
          const priceRangeData = priceRangeIds.map(priceRangeId => ({
            propertyId: property.id,
            priceRangeId: priceRangeId
          }));
          
          await PropertyPriceRange.bulkCreate(priceRangeData);
        }
      }

      // Fetch updated property with configurations and price ranges
      const updatedProperty = await Property.findOne({
        where: { id: property.id },
        include: [
          {
            model: DropdownValue,
            as: 'configurations',
            attributes: ['id', 'value']
          },
          {
            model: DropdownValue,
            as: 'priceRanges',
            attributes: ['id', 'value']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Property updated successfully',
        data: updatedProperty
      });
    } catch (error: any) {
      console.error('Property update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update property',
        error: error.message
      });
    }
  }

  async deleteProperty(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Delete project folder and all associated files
      try {
        await deleteProjectFolder(property.id);
        console.log(`✅ Project folder deleted for property: ${property.id}`);
      } catch (error) {
        console.error('Failed to delete project folder, but property was deleted:', error);
        // Continue with property deletion even if folder cleanup fails
      }

      await property.destroy();

      res.json({
        success: true,
        message: 'Property deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete property'
      });
    }
  }

  // Client API methods
  async getProperties(req: AuthRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        propertyType,
        cityId,
        areaId,
        configurationId,
        priceRangeId,
        statusId
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      const where: any = {
        clientId: req.client!.id,
        isActive: true
      };

      // Filter by property type if provided
      if (propertyType) {
        where.propertyTypeId = propertyType;
      }

      // Apply specific filters (all optional)
      if (cityId && typeof cityId === 'string' && cityId.trim() !== '') {
        where.cityId = cityId;
      }

      if (areaId && typeof areaId === 'string' && areaId.trim() !== '') {
        where.areaId = areaId;
      }

      // Handle configuration filtering using the many-to-many relationship
      const include = [...PropertyService.INCLUDES_WITH_ALL_DROPDOWNS];
      if (configurationId && typeof configurationId === 'string' && configurationId.trim() !== '') {
        // Use exists condition to filter properties that have the specified configuration
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(sequelize.literal(`
          \`Property\`.\`id\` IN (SELECT DISTINCT property_id FROM property_configurations WHERE configuration_id = ${sequelize.escape(configurationId)})
        `));
      }
      
      // Configurations are already included in PropertyService.INCLUDES_WITH_ALL_DROPDOWNS

      // Handle price range filtering using the many-to-many relationship
      if (priceRangeId && typeof priceRangeId === 'string' && priceRangeId.trim() !== '') {
        // Use exists condition to filter properties that have the specified price range
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(sequelize.literal(`
          \`Property\`.\`id\` IN (SELECT DISTINCT property_id FROM property_price_ranges WHERE price_range_id = ${sequelize.escape(priceRangeId)})
        `));
      }
      
      // Price ranges are already included in PropertyService.INCLUDES_WITH_ALL_DROPDOWNS

      if (statusId && typeof statusId === 'string' && statusId.trim() !== '') {
        where.statusId = statusId;
      }

      const { count, rows } = await Property.findAndCountAll({
        where,
        attributes: PropertyService.PUBLIC_ATTRIBUTES,
        include,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        limit: Number(limit),
        offset
      });

      // Format the response using PropertyService
      const formattedProperties = PropertyService.formatPropertiesForAPI(rows);

      res.json({
        success: true,
        data: {
          properties: formattedProperties,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching public properties:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch properties'
      });
    }
  }

  async getPropertiesWithFilters(req: AuthRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        propertyType,
        searchTerm,
        filters = {}
      } = req.body;

      const offset = (Number(page) - 1) * Number(limit);
      
      const where: any = {
        clientId: req.client!.id,
        isActive: true
      };

      // Add text search functionality
      if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
        const searchValue = `%${searchTerm.trim()}%`;
        
        // Create search conditions using Op.and to properly combine with other filters
        const searchConditions = {
          [Op.or]: [
            // Search in basic text fields
            { name: { [Op.like]: searchValue } },
            { slug: { [Op.like]: searchValue } },
            { description: { [Op.like]: searchValue } },
            { shortDescription: { [Op.like]: searchValue } },
            { reraNumber: { [Op.like]: searchValue } },
            { buildingPermissionNumber: { [Op.like]: searchValue } },
            { address: { [Op.like]: searchValue } },
            { city: { [Op.like]: searchValue } },
            { state: { [Op.like]: searchValue } },
            { country: { [Op.like]: searchValue } },
            { postalCode: { [Op.like]: searchValue } },
            // Search in SEO fields
            { seoTitle: { [Op.like]: searchValue } },
            { seoDescription: { [Op.like]: searchValue } },
            { seoKeywords: { [Op.like]: searchValue } },
            // Search in banner fields
            { bannerDesktopAlt: { [Op.like]: searchValue } },
            { bannerMobileAlt: { [Op.like]: searchValue } },
            { bannerDesktopTitle: { [Op.like]: searchValue } },
            { bannerDesktopDescription: { [Op.like]: searchValue } },
            { bannerMobileTitle: { [Op.like]: searchValue } },
            { bannerMobileDescription: { [Op.like]: searchValue } },
            { bannerLinkText: { [Op.like]: searchValue } },
            // Search in logo fields
            { logoAlt: { [Op.like]: searchValue } },
            { logoTitle: { [Op.like]: searchValue } },
            { logoDescription: { [Op.like]: searchValue } },
            // Search in video banner fields
            { videoBannerTitle: { [Op.like]: searchValue } },
            { videoBannerDescription: { [Op.like]: searchValue } },
            // Search in JSON fields using MySQL JSON functions
            sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(\`basic_section_data\`, '$.sectionTitle')) LIKE ${sequelize.escape(searchValue)}`),
            sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(\`basic_dynamic_fields\`, '$')) LIKE ${sequelize.escape(searchValue)}`),
            sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(\`highlights_section_data\`, '$.sectionTitle')) LIKE ${sequelize.escape(searchValue)}`),
            sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(\`highlights_dynamic_fields\`, '$')) LIKE ${sequelize.escape(searchValue)}`),
            sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(\`videos\`, '$')) LIKE ${sequelize.escape(searchValue)}`)
          ]
        };
        
        // Add search conditions to the where clause
        if (where[Op.and]) {
          where[Op.and].push(searchConditions);
        } else {
          where[Op.and] = [searchConditions];
        }
      }

      // Filter by property type if provided
      if (propertyType) {
        where.propertyTypeId = propertyType;
      }

      // Apply specific filters (all optional)
      const { cityId, areaId, configurationId, priceRangeId, statusId } = filters;

      if (cityId && typeof cityId === 'string' && cityId.trim() !== '') {
        where.cityId = cityId;
      }

      if (areaId && typeof areaId === 'string' && areaId.trim() !== '') {
        where.areaId = areaId;
      }

      // Handle many-to-many relationship filtering
      const include = [...PropertyService.INCLUDES_WITH_ALL_DROPDOWNS];
      const idConstraints = [];

      if (configurationId && typeof configurationId === 'string' && configurationId.trim() !== '') {
        idConstraints.push(sequelize.literal(`
          \`Property\`.\`id\` IN (SELECT DISTINCT property_id FROM property_configurations WHERE configuration_id = ${sequelize.escape(configurationId)})
        `));
      }

      if (priceRangeId && typeof priceRangeId === 'string' && priceRangeId.trim() !== '') {
        idConstraints.push(sequelize.literal(`
          \`Property\`.\`id\` IN (SELECT DISTINCT property_id FROM property_price_ranges WHERE price_range_id = ${sequelize.escape(priceRangeId)})
        `));
      }

      // Combine all id constraints if any exist
      if (idConstraints.length > 0) {
        if (where[Op.and]) {
          where[Op.and].push(...idConstraints);
        } else {
          where[Op.and] = idConstraints;
        }
      }

      if (statusId && typeof statusId === 'string' && statusId.trim() !== '') {
        where.statusId = statusId;
      }

      const { count, rows } = await Property.findAndCountAll({
        where,
        attributes: PropertyService.PUBLIC_ATTRIBUTES,
        include,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        limit: Number(limit),
        offset,
        distinct: true // This ensures count doesn't include duplicates from JOINs
      });

      // Format the response using PropertyService
      const formattedProperties = PropertyService.formatPropertiesForAPI(rows);

      res.json({
        success: true,
        data: {
          properties: formattedProperties,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count / Number(limit))
          },
          appliedFilters: {
            ...filters,
            ...(searchTerm && { searchTerm })
          }
        }
      });
    } catch (error) {
      console.error('Error fetching public properties with filters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch properties'
      });
    }
  }

  async getPropertyBySlug(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      console.log('Basic info - req.client:', req.client);
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      console.log('Basic info - slug:', slug, 'clientId:', clientId);

      // Check cache first
      const cacheKey = CacheService.propertyKey(slug, clientId);
      const cachedProperty = await CacheService.get(cacheKey);
      
      if (cachedProperty) {
        return res.json({
          success: true,
          data: cachedProperty,
          cached: true
        });
      }

      // Basic property data with images
      console.log('Basic - Looking for property with:', { slug, clientId, isActive: true });
      const property = await Property.findOne({
        where: {
          slug,
          clientId,
          isActive: true
        },
        attributes: {
          exclude: ['clientId', 'propertyTypeId', 'statusId', 'createdAt', 'updatedAt', 'deletedAt', 'videos']
        },
        include: [
          { 
            association: 'propertyType',
            attributes: ['value', 'slug']
          },
          {
            model: DropdownValue,
            as: 'configurations',
            attributes: ['id', 'value', 'slug', 'color'],
            required: false
          },
          {
            association: 'cityDropdown',
            attributes: ['id', 'value', 'slug'],
            required: false
          },
          {
            association: 'areaDropdown',
            attributes: ['id', 'value', 'slug', 'color'],
            required: false
          },
          {
            model: DropdownValue,
            as: 'priceRanges',
            attributes: ['id', 'value', 'slug', 'color'],
            required: false
          }
        ]
      });

      console.log('Basic - Found property:', property ? property.id : 'undefined');

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Increment view count asynchronously (non-blocking)
      Property.increment('viewCount', { 
        where: { slug, clientId, isActive: true } 
      }).catch(console.error);

      const propertyData: any = property.toJSON();

      // Fetch price appreciation sticker
      const priceAppreciationSticker = await PropertyImage.findOne({
        where: {
          propertyId: property.id,
          componentType: 'price_appreciation_sticker',
          isActive: true
        },
        attributes: ['id', 'fileUrl', 'cdnUrl', 'altText', 'title', 'description'],
        order: [['created_at', 'DESC']]
      });

      // Add price appreciation sticker to property data
      if (priceAppreciationSticker) {
        propertyData.priceAppreciationSticker = {
          id: priceAppreciationSticker.id,
          url: priceAppreciationSticker.cdnUrl || priceAppreciationSticker.fileUrl,
          altText: priceAppreciationSticker.altText,
          title: priceAppreciationSticker.title,
          description: priceAppreciationSticker.description
        };
      }

      // Cache the result for 5 minutes
      await CacheService.set(cacheKey, propertyData, 300);

      res.json({
        success: true,
        data: propertyData
      });
    } catch (error) {
      console.error('Error fetching property by slug:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch property'
      });
    }
  }

  // Upload property banner
  async uploadPropertyBannerImage(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 Banner upload request received:', {
        propertyId: req.params.id,
        bannerType: req.body.bannerType,
        hasFile: !!req.file,
        fileName: req.file?.originalname
      });

      const { id } = req.params;
      const { bannerType } = req.body; // 'desktop' or 'mobile'
      
      if (!bannerType || !['desktop', 'mobile'].includes(bannerType)) {
        console.error('❌ Invalid banner type:', bannerType);
        return res.status(400).json({
          success: false,
          message: 'Banner type must be either "desktop" or "mobile"'
        });
      }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Upload to Digital Ocean Spaces
      console.log('📤 Starting upload to Digital Ocean Spaces...');
      const uploadResult = await uploadPropertyBanner(
        req.file,
        req.file.originalname,
        property.id,
        bannerType
      );
      console.log('✅ Upload successful:', uploadResult);

      // Update property with banner URL and metadata
      const updateData: any = {};
      const altTextField = bannerType === 'desktop' ? 'bannerDesktopAlt' : 'bannerMobileAlt';
      const titleField = bannerType === 'desktop' ? 'bannerDesktopTitle' : 'bannerMobileTitle';
      const descriptionField = bannerType === 'desktop' ? 'bannerDesktopDescription' : 'bannerMobileDescription';
      const urlField = bannerType === 'desktop' ? 'bannerDesktopUrl' : 'bannerMobileUrl';
      
      updateData[urlField] = uploadResult.url;
      updateData[altTextField] = req.body.altText || `${property.name} ${bannerType} banner`;
      if (req.body.title) updateData[titleField] = req.body.title;
      if (req.body.description) updateData[descriptionField] = req.body.description;

      console.log('💾 Updating property with banner data:', updateData);
      await property.update(updateData);
      console.log('✅ Property updated successfully');

      res.json({
        success: true,
        message: `${bannerType} banner uploaded successfully`,
        data: {
          url: uploadResult.url,
          key: uploadResult.key,
          bannerType
        }
      });
    } catch (error) {
      console.error('Banner upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload banner'
      });
    }
  }

  // Update property banner info (link, alt text, etc.)
  async updatePropertyBannerInfo(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { 
        bannerLinkUrl, 
        bannerLinkText, 
        bannerDesktopAlt, 
        bannerMobileAlt,
        bannerDesktopTitle,
        bannerDesktopDescription,
        bannerMobileTitle,
        bannerMobileDescription
      } = req.body;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const updateData: any = {};
      if (bannerLinkUrl !== undefined) updateData.bannerLinkUrl = bannerLinkUrl;
      if (bannerLinkText !== undefined) updateData.bannerLinkText = bannerLinkText;
      if (bannerDesktopAlt !== undefined) updateData.bannerDesktopAlt = bannerDesktopAlt;
      if (bannerMobileAlt !== undefined) updateData.bannerMobileAlt = bannerMobileAlt;
      if (bannerDesktopTitle !== undefined) updateData.bannerDesktopTitle = bannerDesktopTitle;
      if (bannerDesktopDescription !== undefined) updateData.bannerDesktopDescription = bannerDesktopDescription;
      if (bannerMobileTitle !== undefined) updateData.bannerMobileTitle = bannerMobileTitle;
      if (bannerMobileDescription !== undefined) updateData.bannerMobileDescription = bannerMobileDescription;

      await property.update(updateData);

      res.json({
        success: true,
        message: 'Banner information updated successfully',
        data: updateData
      });
    } catch (error) {
      console.error('Banner info update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update banner information'
      });
    }
  }

  // Delete property banner
  async deletePropertyBanner(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { bannerType } = req.body; // 'desktop' or 'mobile'

      if (!bannerType || !['desktop', 'mobile'].includes(bannerType)) {
        return res.status(400).json({
          success: false,
          message: 'Banner type must be either "desktop" or "mobile"'
        });
      }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Clear banner URL and alt text
      const updateData: any = {};
      const altTextField = bannerType === 'desktop' ? 'bannerDesktopAlt' : 'bannerMobileAlt';
      const urlField = bannerType === 'desktop' ? 'bannerDesktopUrl' : 'bannerMobileUrl';
      
      updateData[urlField] = null;
      updateData[altTextField] = null;

      await property.update(updateData);

      res.json({
        success: true,
        message: `${bannerType} banner deleted successfully`
      });
    } catch (error) {
      console.error('Banner delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete banner'
      });
    }
  }

  // Upload property logo
  async uploadPropertyLogo(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 Logo upload request received:', {
        propertyId: req.params.id,
        hasFile: !!req.file,
        fileName: req.file?.originalname
      });

      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Upload to Digital Ocean Spaces
      console.log('📤 Starting logo upload to Digital Ocean Spaces...');
      const uploadResult = await uploadFile(
        req.file,
        req.file.originalname,
        {
          folder: MediaFolder.PROJECTS,
          projectId: property.id,
          fileName: `logo-${Date.now()}-${req.file.originalname}`,
          isPublic: true,
          metadata: {
            'file-type': 'logo',
            'property-id': property.id,
            'upload-timestamp': new Date().toISOString()
          }
        }
      );
      console.log('✅ Logo upload successful:', uploadResult);

      // Update property with logo URL and metadata
      const updateData: any = {
        logoUrl: uploadResult.url,
        logoAlt: req.body.altText || `${property.name} logo`
      };
      if (req.body.title) updateData.logoTitle = req.body.title;
      if (req.body.description) updateData.logoDescription = req.body.description;

      console.log('💾 Updating property with logo data:', updateData);
      await property.update(updateData);
      console.log('✅ Property updated successfully');

      res.json({
        success: true,
        message: 'Logo uploaded successfully',
        data: {
          url: uploadResult.url,
          key: uploadResult.key
        }
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload logo'
      });
    }
  }

  // Delete property logo
  async deletePropertyLogo(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Clear logo URL and metadata
      await property.update({
        logoUrl: undefined,
        logoAlt: undefined,
        logoTitle: undefined,
        logoDescription: undefined
      });

      res.json({
        success: true,
        message: 'Logo deleted successfully'
      });
    } catch (error) {
      console.error('Logo delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete logo'
      });
    }
  }

  // Update property logo info (alt text, title, description)
  async updatePropertyLogoInfo(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { logoAlt, logoTitle, logoDescription } = req.body;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const updateData: any = {};
      if (logoAlt !== undefined) updateData.logoAlt = logoAlt;
      if (logoTitle !== undefined) updateData.logoTitle = logoTitle;
      if (logoDescription !== undefined) updateData.logoDescription = logoDescription;

      await property.update(updateData);

      res.json({
        success: true,
        message: 'Logo information updated successfully',
        data: updateData
      });
    } catch (error) {
      console.error('Logo info update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update logo information'
      });
    }
  }

  // Price Appreciation Sticker methods
  async uploadPropertyPriceAppreciationSticker(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 Price appreciation sticker upload request received:', {
        propertyId: req.params.id,
        hasFile: !!req.file,
        fileName: req.file?.originalname
      });

      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Upload to Digital Ocean Spaces
      console.log('📤 Starting price appreciation sticker upload to Digital Ocean Spaces...');
      const uploadResult = await uploadFile(
        req.file,
        req.file.originalname,
        {
          folder: MediaFolder.PROJECTS,
          projectId: property.id,
          fileName: `price-appreciation-sticker-${Date.now()}-${req.file.originalname}`,
          isPublic: true,
          metadata: {
            'file-type': 'price-appreciation-sticker',
            'property-id': property.id,
            'upload-timestamp': new Date().toISOString()
          }
        }
      );
      console.log('✅ Price appreciation sticker upload successful:', uploadResult);

      // Create PropertyImage record with component_type = 'price_appreciation_sticker'
      const propertyImage = await PropertyImage.create({
        propertyId: property.id,
        fileName: uploadResult.key.split('/').pop() || req.file.originalname,
        originalName: req.file.originalname,
        filePath: uploadResult.key,
        fileUrl: uploadResult.url,
        cdnUrl: uploadResult.cdnUrl,
        altText: req.body.altText || `${property.name} price appreciation sticker`,
        title: req.body.title || '',
        description: req.body.description || '',
        componentType: 'price_appreciation_sticker',
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        isPrimary: false,
        sortOrder: 0,
        isActive: true
      });

      console.log('✅ PropertyImage created successfully:', propertyImage.id);

      res.json({
        success: true,
        message: 'Price appreciation sticker uploaded successfully',
        data: {
          id: propertyImage.id,
          url: uploadResult.url,
          key: uploadResult.key
        }
      });
    } catch (error) {
      console.error('Price appreciation sticker upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload price appreciation sticker'
      });
    }
  }

  // Delete property price appreciation sticker
  async deletePropertyPriceAppreciationSticker(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Find and delete the price appreciation sticker image
      const stickerImage = await PropertyImage.findOne({
        where: {
          propertyId: property.id,
          componentType: 'price_appreciation_sticker'
        }
      });

      if (stickerImage) {
        await stickerImage.destroy();
      }

      res.json({
        success: true,
        message: 'Price appreciation sticker deleted successfully'
      });
    } catch (error) {
      console.error('Price appreciation sticker delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete price appreciation sticker'
      });
    }
  }

  // Update property price appreciation sticker info
  async updatePropertyPriceAppreciationStickerInfo(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { 
        priceAppreciationStickerAlt, 
        priceAppreciationStickerTitle, 
        priceAppreciationStickerDescription,
        priceAppreciationStickerActive
      } = req.body;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Find the price appreciation sticker image
      const stickerImage = await PropertyImage.findOne({
        where: {
          propertyId: property.id,
          componentType: 'price_appreciation_sticker'
        }
      });

      if (!stickerImage) {
        return res.status(404).json({
          success: false,
          message: 'Price appreciation sticker not found'
        });
      }

      const updateData: any = {};
      if (priceAppreciationStickerAlt !== undefined) updateData.altText = priceAppreciationStickerAlt;
      if (priceAppreciationStickerTitle !== undefined) updateData.title = priceAppreciationStickerTitle;
      if (priceAppreciationStickerDescription !== undefined) updateData.description = priceAppreciationStickerDescription;
      if (priceAppreciationStickerActive !== undefined) updateData.isActive = priceAppreciationStickerActive;

      await stickerImage.update(updateData);

      res.json({
        success: true,
        message: 'Price appreciation sticker information updated successfully',
        data: updateData
      });
    } catch (error) {
      console.error('Price appreciation sticker info update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update price appreciation sticker information'
      });
    }
  }

  // Get property images by component type (Admin)
  async getPropertyImagesAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { component_type } = req.query;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Build where clause for images
      const imageWhere: any = {
        propertyId: property.id
      };

      if (component_type) {
        imageWhere.componentType = component_type;
      }

      const images = await PropertyImage.findAll({
        where: imageWhere,
        order: [['sortOrder', 'ASC'], ['created_at', 'ASC']],
      });

      res.json({
        success: true,
        data: images
      });
    } catch (error) {
      console.error('Get property images admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get property images'
      });
    }
  }

  // Gallery methods
  
  // Get property gallery images
  async getPropertyGalleryAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const images = await PropertyImage.findAll({
        where: { 
          propertyId: property.id,
          componentType: 'gallery',
          isActive: true
        },
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      res.json({
        success: true,
        data: images
      });
    } catch (error) {
      console.error('Gallery fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gallery images'
      });
    }
  }

  // Upload multiple gallery images
  async uploadGalleryImages(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 Gallery upload request received:', {
        propertyId: req.params.id,
        fileCount: req.files?.length || 0,
        files: Array.isArray(req.files) ? req.files.map((f: any) => f.originalname) : []
      });

      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Get current max sort order
      const maxSortOrder = await PropertyImage.max('sortOrder', {
        where: { propertyId: property.id, isActive: true }
      }) as number || 0;

      console.log('📤 Starting gallery upload to Digital Ocean Spaces...');
      
      // Upload files to Digital Ocean Spaces
      const uploadResults = await uploadFiles(req.files, {
        folder: MediaFolder.PROJECTS,
        projectId: property.id,
        isPublic: true,
       // Gallery images
        metadata: {
          'file-type': 'gallery',
          'property-id': property.id,
          'upload-timestamp': new Date().toISOString()
        }
      });

      console.log('✅ Gallery upload successful:', uploadResults.length, 'files');

      // Create PropertyImage records
      const imageRecords = [];
      for (let i = 0; i < uploadResults.length; i++) {
        const uploadResult = uploadResults[i];
        const file = req.files[i];
        
        const imageRecord = await PropertyImage.create({
          propertyId: property.id,
          fileName: uploadResult.key.split('/').pop() || file.originalname,
          originalName: file.originalname,
          filePath: uploadResult.key,
          fileUrl: uploadResult.url,
          cdnUrl: uploadResult.cdnUrl,
          altText: `${property.name} gallery image`,
          fileSize: uploadResult.size,
          mimeType: uploadResult.mimeType,
          componentType: 'gallery',
          sortOrder: maxSortOrder + i + 1,
          isPrimary: false,
          isActive: true
        });

        imageRecords.push(imageRecord);
      }

      console.log('✅ Gallery images saved to database');

      res.json({
        success: true,
        message: `${imageRecords.length} images uploaded successfully`,
        data: imageRecords
      });
    } catch (error) {
      console.error('Gallery upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload gallery images'
      });
    }
  }

  // Update gallery image order
  async updateGalleryOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { imageOrder } = req.body; // Array of { id, sortOrder }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!Array.isArray(imageOrder)) {
        return res.status(400).json({
          success: false,
          message: 'imageOrder must be an array'
        });
      }

      // Update sort order for each image
      const updatePromises = imageOrder.map(({ id: imageId, sortOrder }) =>
        PropertyImage.update(
          { sortOrder },
          { 
            where: { 
              id: imageId, 
              propertyId: property.id,
              isActive: true 
            } 
          }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Gallery order updated successfully'
      });
    } catch (error) {
      console.error('Gallery order update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update gallery order'
      });
    }
  }

  // Delete gallery image
  async deleteGalleryImage(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const image = await PropertyImage.findOne({
        where: { 
          id: imageId, 
          propertyId: property.id,
          isActive: true 
        }
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      // Soft delete the image
      await image.update({ isActive: false });

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Gallery image delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  }

  // Set primary gallery image
  async setPrimaryGalleryImage(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Clear existing primary image
      await PropertyImage.update(
        { isPrimary: false },
        { 
          where: { 
            propertyId: property.id,
            isActive: true 
          } 
        }
      );

      // Set new primary image
      const image = await PropertyImage.findOne({
        where: { 
          id: imageId, 
          propertyId: property.id,
          isActive: true 
        }
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      await image.update({ isPrimary: true });

      res.json({
        success: true,
        message: 'Primary image set successfully'
      });
    } catch (error) {
      console.error('Set primary image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set primary image'
      });
    }
  }

  // Update gallery image metadata (alt text, title, description)
  async updateGalleryImageMetadata(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;
      const { altText, title, description } = req.body;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Gallery images are stored in property_images table with componentType 'gallery'
      let image = await PropertyImage.findOne({
        where: { 
          id: imageId, 
          propertyId: property.id,
          componentType: 'gallery'
        }
      });

      // If not found, check if it exists but is soft-deleted (for admin access)
      if (!image) {
        console.log(`Gallery image ${imageId} not found in active records, checking soft-deleted...`);
        image = await PropertyImage.findOne({
          where: { 
            id: imageId, 
            propertyId: property.id,
            componentType: 'gallery'
          },
          paranoid: false // Include soft-deleted records
        });

        if (image && image.deletedAt) {
          console.log(`Gallery image ${imageId} is soft-deleted, but allowing admin update`);
        }
      }

      if (!image) {
        console.log(`Gallery image ${imageId} does not exist for property ${property.id} with componentType 'gallery'`);
        return res.status(404).json({
          success: false,
          message: 'Gallery image not found'
        });
      }

      const updateData: any = {};
      if (altText !== undefined) updateData.altText = altText;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;

      await image.update(updateData);

      res.json({
        success: true,
        message: 'Gallery image metadata updated successfully',
        data: image
      });
    } catch (error) {
      console.error('Gallery image metadata update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update gallery image metadata'
      });
    }
  }

  // Separate endpoint methods for property data
  async getPropertyGallery(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = CacheService.propertyGalleryKey(slug, clientId);

      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      // Find property first to get ID
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Get only gallery images
      const galleryImages = await PropertyImage.findAll({
        where: { 
          propertyId: property.id, 
          componentType: 'gallery',
          isActive: true 
        },
        order: [['sort_order', 'ASC']],
        attributes: ['id', 'fileName', 'fileUrl', 'filePath', 'altText', 'title', 'description', 'sortOrder']
      });

      // Cache for 5 minutes
      await CacheService.set(cacheKey, galleryImages, 300);

      res.json({ success: true, data: galleryImages });
    } catch (error) {
      console.error('Error fetching property gallery:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property gallery' });
    }
  }

  async getPropertyImages(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const { component_type } = req.query;
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = `property:${clientId}:${slug}:images:${component_type || 'all'}`;

      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      // Find property first to get ID
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Build where clause
      const whereClause: any = {
        propertyId: property.id,
        isActive: true
      };

      // Add component_type filter if provided
      if (component_type) {
        whereClause.componentType = component_type;
      }

      // Get images
      const images = await PropertyImage.findAll({
        where: whereClause,
        order: [['sort_order', 'ASC']],
        attributes: ['id', 'fileName', 'fileUrl', 'filePath', 'altText', 'title', 'description', 'sortOrder', 'componentType']
      });

      // Cache for 5 minutes
      await CacheService.set(cacheKey, images, 300);

      res.json({ success: true, data: images });
    } catch (error) {
      console.error('Error fetching property images:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property images' });
    }
  }




  async getPropertyLocationHighlights(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = `property:${clientId}:${slug}:location-highlights`;

      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      // Find property first to get ID
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Get location highlights
      const locationHighlights = await PropertyLocationHighlight.findAll({
        where: { propertyId: property.id },
        attributes: ['id', 'name', 'value', 'iconId', 'iframeUrl', 'level', 'parentId', 'sortOrder'],
        include: [{
          association: 'icon',
          attributes: ['id', 'spacesUrl', 'cdnUrl', 'fileName'],
          where: { isActive: true },
          required: false
        }],
        order: [['level', 'ASC'], ['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      // Transform flat array into hierarchical structure
      const hierarchicalData = transformToHierarchical(locationHighlights);

      // Cache for 5 minutes
      await CacheService.set(cacheKey, hierarchicalData, 300);

      res.json({ success: true, data: hierarchicalData });
    } catch (error) {
      console.error('Error fetching property location highlights:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property location highlights' });
    }
  }

  async getPropertyOverviewHighlights(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = `property:${clientId}:${slug}:overview-highlights`;

      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      // Find property first to get ID
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Get overview highlights
      const overviewHighlights = await PropertyOverviewHighlight.findAll({
        where: { propertyId: property.id },
        attributes: ['id', 'name', 'iconId'],
        include: [{
          association: 'icon',
          attributes: ['id', 'spacesUrl', 'cdnUrl', 'fileName'],
          where: { isActive: true },
          required: false
        }],
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      // Cache for 5 minutes
      await CacheService.set(cacheKey, overviewHighlights, 300);

      res.json({ success: true, data: overviewHighlights });
    } catch (error) {
      console.error('Error fetching property overview highlights:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property overview highlights' });
    }
  }

  async getPropertyTestimonials(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = `property:${clientId}:${slug}:testimonials`;

      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      // Find property first to get ID
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Get video testimonials
      const testimonials = await PropertyVideoTestimonial.findAll({
        where: { 
          propertyId: property.id,
          isActive: true
        },
        attributes: [
          'id', 
          'customerName', 
          'designation', 
          'testimonialText', 
          'youtubeUrl', 
          'rating', 
          'sortOrder'
        ],
        order: [['sortOrder', 'ASC']]
      });

      // Cache for 5 minutes
      await CacheService.set(cacheKey, testimonials, 300);

      res.json({ success: true, data: testimonials });
    } catch (error) {
      console.error('Error fetching property testimonials:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property testimonials' });
    }
  }

  async getPropertyAmenities(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      console.log('Amenities - req.client:', req.client);
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = CacheService.propertyAmenitiesKey(slug, clientId);

      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      // Find property first to get ID
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Get amenities highlights
      const amenitiesHighlights = await PropertyAmenitiesHighlight.findAll({
        where: { propertyId: property.id },
        attributes: ['id', 'name', 'value', 'iconId', 'iframeUrl', 'level', 'parentId'],
        include: [{
          association: 'icon',
          attributes: ['id', 'spacesUrl', 'cdnUrl', 'fileName'],
          where: { isActive: true },
          required: false
        }],
        order: [['level', 'ASC'], ['name', 'ASC']]
      });

      // Transform to hierarchical structure
      const hierarchicalAmenities = transformToHierarchical(amenitiesHighlights);

      // Cache for 5 minutes
      await CacheService.set(cacheKey, hierarchicalAmenities, 300);

      res.json({ success: true, data: hierarchicalAmenities });
    } catch (error) {
      console.error('Error fetching property amenities:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property amenities' });
    }
  }

  // Misc Images methods
  
  // Get property misc images
  async getPropertyMiscImages(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const miscImages = await PropertyImage.findAll({
        where: { 
          propertyId: property.id,
          fileName: {
            [Op.like]: 'misc-%'
          },
          isActive: true 
        },
        order: [['sort_order', 'ASC']]
      });

      res.json({
        success: true,
        data: miscImages
      });
    } catch (error) {
      console.error('Error fetching misc images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch misc images'
      });
    }
  }

  // Upload misc images
  async uploadMiscImages(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 Misc images upload request received:', {
        propertyId: req.params.id,
        fileCount: req.files?.length || 0,
        files: Array.isArray(req.files) ? req.files.map((f: any) => f.originalname) : []
      });
      
      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Get current max sort order
      const maxSortOrder = (await PropertyImage.max('sortOrder', {
        where: { 
          propertyId: property.id,
          fileName: {
            [Op.like]: 'misc-%'
          },
          isActive: true 
        }
      }) as number) || 0;

      console.log('📤 Starting misc images upload to Digital Ocean Spaces...');
      
      // Upload files to Digital Ocean Spaces
      const uploadResults = await uploadFiles(req.files, {
        folder: MediaFolder.PROJECTS,
        projectId: property.id,
        isPublic: true,
      // Misc images
        metadata: {
          'file-type': 'misc',
          'property-id': property.id,
          'upload-timestamp': new Date().toISOString()
        }
      });
      
      console.log('✅ Misc images upload successful:', uploadResults.length, 'files');

      // Create PropertyImage records with misc component type
      const imageRecords = [];
      for (let i = 0; i < uploadResults.length; i++) {
        const uploadResult = uploadResults[i];
        const file = req.files[i];
        
        // Add misc- prefix to fileName for identification, but keep original filePath for access
        const originalFileName = uploadResult.key.split('/').pop() || file.originalname;
        const miscFileName = `misc-${originalFileName}`;
        
        const imageRecord = await PropertyImage.create({
          propertyId: property.id,
          fileName: miscFileName,
          originalName: file.originalname,
          filePath: uploadResult.key, // Keep original path for file access
          fileUrl: uploadResult.url,
          cdnUrl: uploadResult.cdnUrl,
          componentType: 'misc-images',
          title: `${property.name} misc image ${i + 1}`,
          altText: `${property.name} misc image`,
          fileSize: file.size,
          mimeType: file.mimetype,
          width: uploadResult.metadata?.width ? Number(uploadResult.metadata.width) : undefined,
          height: uploadResult.metadata?.height ? Number(uploadResult.metadata.height) : undefined,
          sortOrder: maxSortOrder + i + 1,
          isPrimary: false,
          isActive: true
        });
        
        imageRecords.push(imageRecord);
      }

      console.log('✅ Misc images saved to database');
      res.json({
        success: true,
        message: `${imageRecords.length} misc images uploaded successfully`,
        data: imageRecords
      });
    } catch (error) {
      console.error('Misc images upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload misc images'
      });
    }
  }

  // Update misc images order
  async updateMiscImagesOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { imageOrder } = req.body; // Array of { id, sortOrder }
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!Array.isArray(imageOrder)) {
        return res.status(400).json({
          success: false,
          message: 'imageOrder must be an array'
        });
      }

      // Update sort order for each misc image
      const updatePromises = imageOrder.map(({ id: imageId, sortOrder }) =>
        PropertyImage.update(
          { sortOrder },
          { 
            where: { 
              id: imageId, 
              propertyId: property.id,
              fileName: {
                [Op.like]: 'misc-%'
              },
              isActive: true 
            } 
          }
        )
      );
      
      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Misc images order updated successfully'
      });
    } catch (error) {
      console.error('Misc images order update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update misc images order'
      });
    }
  }

  // Delete misc image
  async deleteMiscImage(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const image = await PropertyImage.findOne({
        where: { 
          id: imageId, 
          propertyId: property.id,
          componentType: 'misc-images',
          isActive: true 
        }
      });
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Misc image not found'
        });
      }

      // Soft delete the image
      await image.update({ isActive: false });

      res.json({
        success: true,
        message: 'Misc image deleted successfully'
      });
    } catch (error) {
      console.error('Misc image delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete misc image'
      });
    }
  }

  // Update misc image metadata
  async updateMiscImage(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;
      const { title, description, altText } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const image = await PropertyImage.findOne({
        where: { 
          id: imageId, 
          propertyId: property.id,
          fileName: {
            [Op.like]: 'misc-%'
          },
          isActive: true 
        }
      });
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Misc image not found'
        });
      }

      // Update image metadata
      await image.update({
        title: title || image.title,
        description: description || image.description,
        altText: altText || image.altText
      });

      res.json({
        success: true,
        message: 'Misc image updated successfully',
        data: image
      });
    } catch (error) {
      console.error('Misc image update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update misc image'
      });
    }
  }

  // Floor plan methods
  
  // Get property floor plans
  async getPropertyFloorPlans(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const floorPlans = await PropertyImage.findAll({
        where: { 
          propertyId: property.id,
          componentType: 'floor-plans',
          isActive: true 
        },
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      res.json({
        success: true,
        data: floorPlans
      });
    } catch (error) {
      console.error('Floor plans fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch floor plans'
      });
    }
  }

  // Upload multiple floor plans
  async uploadFloorPlans(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 Floor plans upload request received:', {
        propertyId: req.params.id,
        fileCount: req.files?.length || 0,
        files: Array.isArray(req.files) ? req.files.map((f: any) => f.originalname) : [],
        titles: req.body.titles,
        descriptions: req.body.descriptions
      });

      const { id } = req.params;
      
      // Parse titles, descriptions, and altTexts from FormData
      let titles: string[] = [];
      let descriptions: string[] = [];
      let altTexts: string[] = [];
      
      try {
        if (req.body.titles) {
          if (typeof req.body.titles === 'string') {
            titles = JSON.parse(req.body.titles);
          } else if (Array.isArray(req.body.titles)) {
            titles = req.body.titles;
          }
        }
        
        if (req.body.descriptions) {
          if (typeof req.body.descriptions === 'string') {
            descriptions = JSON.parse(req.body.descriptions);
          } else if (Array.isArray(req.body.descriptions)) {
            descriptions = req.body.descriptions;
          }
        }
        
        if (req.body.altTexts) {
          if (typeof req.body.altTexts === 'string') {
            altTexts = JSON.parse(req.body.altTexts);
          } else if (Array.isArray(req.body.altTexts)) {
            altTexts = req.body.altTexts;
          }
        }
      } catch (error) {
        console.error('Error parsing titles/descriptions/altTexts:', error);
        titles = [];
        descriptions = [];
        altTexts = [];
      }
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Get current max sort order
      const maxSortOrder = await PropertyImage.max('sortOrder', {
        where: { 
          propertyId: property.id, 
          componentType: 'floor-plans',
          isActive: true 
        }
      }) as number || 0;

      console.log('📤 Starting floor plans upload to Digital Ocean Spaces...');
      
      // Upload files to Digital Ocean Spaces
      const uploadResults = await uploadFiles(req.files, {
        folder: MediaFolder.PROJECTS,
        projectId: property.id,
        isPublic: true,
      // Floor plan images
        metadata: {
          'file-type': 'floor-plan',
          'property-id': property.id,
          'upload-timestamp': new Date().toISOString()
        }
      });

      console.log('✅ Floor plans upload successful:', uploadResults.length, 'files');

      // Create PropertyImage records with floor-plans component type
      const floorPlanRecords = [];
      for (let i = 0; i < uploadResults.length; i++) {
        const uploadResult = uploadResults[i];
        const file = req.files[i];
        
        const floorPlanRecord = await PropertyImage.create({
          propertyId: property.id,
          componentType: 'floor-plans',
          title: titles[i] || `Floor Plan ${i + 1}`,
          description: descriptions[i] || '',
          fileName: uploadResult.key.split('/').pop() || file.originalname,
          originalName: file.originalname,
          filePath: uploadResult.key,
          fileUrl: uploadResult.url,
          cdnUrl: uploadResult.cdnUrl,
          altText: altTexts[i] || `${property.name} floor plan`,
          fileSize: uploadResult.size,
          mimeType: uploadResult.mimeType,
          sortOrder: maxSortOrder + i + 1,
          isPrimary: false,
          isActive: true
        });

        floorPlanRecords.push(floorPlanRecord);
      }

      console.log('✅ Floor plans saved to database');

      res.json({
        success: true,
        message: `${floorPlanRecords.length} floor plans uploaded successfully`,
        data: floorPlanRecords
      });
    } catch (error) {
      console.error('Floor plans upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload floor plans'
      });
    }
  }

  // Update floor plan details
  async updateFloorPlan(req: AuthRequest, res: Response) {
    try {
      const { id, floorPlanId } = req.params;
      const { title, description, altText } = req.body;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Floor plans are stored in property_images table with componentType 'floor-plans'
      let floorPlan = await PropertyImage.findOne({
        where: { 
          id: floorPlanId, 
          propertyId: property.id,
          componentType: 'floor-plans'
        }
      });

      // If not found, check if it exists but is soft-deleted (for admin access)
      if (!floorPlan) {
        console.log(`Floor plan ${floorPlanId} not found in active records, checking soft-deleted...`);
        floorPlan = await PropertyImage.findOne({
          where: { 
            id: floorPlanId, 
            propertyId: property.id,
            componentType: 'floor-plans'
          },
          paranoid: false // Include soft-deleted records
        });

        if (floorPlan && floorPlan.deletedAt) {
          console.log(`Floor plan ${floorPlanId} is soft-deleted, but allowing admin update`);
        }
      }

      if (!floorPlan) {
        console.log(`Floor plan ${floorPlanId} does not exist for property ${property.id} with componentType 'floor-plans'`);
        return res.status(404).json({
          success: false,
          message: 'Floor plan not found'
        });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (altText !== undefined) updateData.altText = altText;

      await floorPlan.update(updateData);

      res.json({
        success: true,
        message: 'Floor plan updated successfully',
        data: floorPlan
      });
    } catch (error) {
      console.error('Floor plan update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update floor plan'
      });
    }
  }

  // Update floor plan order
  async updateFloorPlanOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { floorPlanOrder } = req.body; // Array of { id, sortOrder }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!Array.isArray(floorPlanOrder)) {
        return res.status(400).json({
          success: false,
          message: 'floorPlanOrder must be an array'
        });
      }

      // Update sort order for each floor plan (stored in property_images table)
      const updatePromises = floorPlanOrder.map(({ id: floorPlanId, sortOrder }) =>
        PropertyImage.update(
          { sortOrder },
          { 
            where: { 
              id: floorPlanId, 
              propertyId: property.id,
              componentType: 'floor-plans',
              isActive: true 
            } 
          }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Floor plan order updated successfully'
      });
    } catch (error) {
      console.error('Floor plan order update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update floor plan order'
      });
    }
  }

  // Delete floor plan
  async deleteFloorPlan(req: AuthRequest, res: Response) {
    try {
      const { id, floorPlanId } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const floorPlan = await PropertyImage.findOne({
        where: { 
          id: floorPlanId, 
          propertyId: property.id,
          componentType: 'floor-plans',
          isActive: true 
        }
      });

      if (!floorPlan) {
        return res.status(404).json({
          success: false,
          message: 'Floor plan not found'
        });
      }

      // Soft delete the floor plan
      await floorPlan.update({ isActive: false });

      res.json({
        success: true,
        message: 'Floor plan deleted successfully'
      });
    } catch (error) {
      console.error('Floor plan delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete floor plan'
      });
    }
  }

  // Layout methods (clone of floor plan methods)

  // Get property layouts
  async getPropertyLayouts(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const layouts = await PropertyImage.findAll({
        where: { 
          propertyId: property.id,
          componentType: 'layouts',
          isActive: true 
        },
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      res.json({
        success: true,
        data: layouts
      });
    } catch (error) {
      console.error('Layouts fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch layouts'
      });
    }
  }

  // Upload multiple layouts
  async uploadLayouts(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 Layouts upload request received:', {
        propertyId: req.params.id,
        fileCount: req.files?.length || 0,
        files: Array.isArray(req.files) ? req.files.map((f: any) => f.originalname) : [],
        titles: req.body.titles,
        descriptions: req.body.descriptions
      });

      const { id } = req.params;
      
      // Parse titles, descriptions, and altTexts from FormData
      let titles: string[] = [];
      let descriptions: string[] = [];
      let altTexts: string[] = [];
      
      try {
        if (req.body.titles) {
          if (typeof req.body.titles === 'string') {
            titles = JSON.parse(req.body.titles);
          } else if (Array.isArray(req.body.titles)) {
            titles = req.body.titles;
          }
        }
        
        if (req.body.descriptions) {
          if (typeof req.body.descriptions === 'string') {
            descriptions = JSON.parse(req.body.descriptions);
          } else if (Array.isArray(req.body.descriptions)) {
            descriptions = req.body.descriptions;
          }
        }
        
        if (req.body.altTexts) {
          if (typeof req.body.altTexts === 'string') {
            altTexts = JSON.parse(req.body.altTexts);
          } else if (Array.isArray(req.body.altTexts)) {
            altTexts = req.body.altTexts;
          }
        }
      } catch (error) {
        console.error('Error parsing titles/descriptions/altTexts:', error);
        titles = [];
        descriptions = [];
        altTexts = [];
      }
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Get current max sort order
      const maxSortOrder = await PropertyImage.max('sortOrder', {
        where: { 
          propertyId: property.id, 
          componentType: 'layouts',
          isActive: true 
        }
      }) as number || 0;

      console.log('📤 Starting layouts upload to Digital Ocean Spaces...');
      
      // Upload files to Digital Ocean Spaces
      const uploadResults = await uploadFiles(req.files, {
        folder: MediaFolder.PROJECTS,
        projectId: property.id,
        isPublic: true,
       // Layout images
        metadata: {
          'file-type': 'layout',
          'property-id': property.id,
          'upload-timestamp': new Date().toISOString()
        }
      });

      console.log('✅ Layouts upload successful:', uploadResults.length, 'files');

      // Create PropertyImage records with layout component type
      const layoutRecords = [];
      for (let i = 0; i < uploadResults.length; i++) {
        const uploadResult = uploadResults[i];
        const file = req.files[i];
        
        const layoutRecord = await PropertyImage.create({
          propertyId: property.id,
          componentType: 'layouts',
          title: titles[i] || `Layout ${i + 1}`,
          description: descriptions[i] || '',
          fileName: uploadResult.key.split('/').pop() || file.originalname,
          originalName: file.originalname,
          filePath: uploadResult.key,
          fileUrl: uploadResult.url,
          cdnUrl: uploadResult.cdnUrl,
          altText: altTexts[i] || `${property.name} layout`,
          fileSize: uploadResult.size,
          mimeType: uploadResult.mimeType,
          sortOrder: maxSortOrder + i + 1,
          isPrimary: false,
          isActive: true
        });

        layoutRecords.push(layoutRecord);
      }

      console.log('✅ Layouts saved to database');

      res.json({
        success: true,
        message: `${layoutRecords.length} layouts uploaded successfully`,
        data: layoutRecords
      });
    } catch (error) {
      console.error('Layouts upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload layouts'
      });
    }
  }

  // Update layout details
  async updateLayout(req: AuthRequest, res: Response) {
    try {
      const { id, layoutId } = req.params;
      const { title, description, altText } = req.body;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Layouts are stored in property_images table with componentType 'layouts'
      let layout = await PropertyImage.findOne({
        where: { 
          id: layoutId, 
          propertyId: property.id,
          componentType: 'layouts'
        }
      });

      // If not found, check if it exists but is soft-deleted (for admin access)
      if (!layout) {
        console.log(`Layout ${layoutId} not found in active records, checking soft-deleted...`);
        layout = await PropertyImage.findOne({
          where: { 
            id: layoutId, 
            propertyId: property.id,
            componentType: 'layouts'
          },
          paranoid: false // Include soft-deleted records
        });

        if (layout && layout.deletedAt) {
          console.log(`Layout ${layoutId} is soft-deleted, but allowing admin update`);
        }
      }

      if (!layout) {
        console.log(`Layout ${layoutId} does not exist for property ${property.id} with componentType 'layouts'`);
        return res.status(404).json({
          success: false,
          message: 'Layout not found'
        });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (altText !== undefined) updateData.altText = altText;

      await layout.update(updateData);

      res.json({
        success: true,
        message: 'Layout updated successfully',
        data: layout
      });
    } catch (error) {
      console.error('Layout update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update layout'
      });
    }
  }

  // Update layout order
  async updateLayoutOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { layoutOrder } = req.body; // Array of { id, sortOrder }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!Array.isArray(layoutOrder)) {
        return res.status(400).json({
          success: false,
          message: 'layoutOrder must be an array'
        });
      }

      // Update sort order for each layout (stored in property_images table)
      const updatePromises = layoutOrder.map(({ id: layoutId, sortOrder }) =>
        PropertyImage.update(
          { sortOrder },
          { 
            where: { 
              id: layoutId, 
              propertyId: property.id,
              componentType: 'layouts',
              isActive: true 
            } 
          }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Layout order updated successfully'
      });
    } catch (error) {
      console.error('Layout order update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update layout order'
      });
    }
  }

  // Delete layout
  async deleteLayout(req: AuthRequest, res: Response) {
    try {
      const { id, layoutId } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const layout = await PropertyImage.findOne({
        where: { 
          id: layoutId, 
          propertyId: property.id,
          componentType: 'layouts',
          isActive: true 
        }
      });

      if (!layout) {
        return res.status(404).json({
          success: false,
          message: 'Layout not found'
        });
      }

      // Soft delete the layout
      await layout.update({ isActive: false });

      res.json({
        success: true,
        message: 'Layout deleted successfully'
      });
    } catch (error) {
      console.error('Layout delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete layout'
      });
    }
  }

  // Basic Info methods
  async getPropertyBasicInfo(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const property = await Property.findByPk(id, {
        attributes: [
          'id', 'name', 'description', 'shortDescription',
          'reraNumber', 'buildingPermissionNumber', 'reraWebsite',
          'basicSectionData', 'basicDynamicFields'
        ]
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Get section data from JSON field or provide defaults
      const sectionData = property.basicSectionData || {
        sectionTitle: 'Property Essentials',
        sectionTexts: [
          'Discover the key features that make this property unique.',
          'All essential details are carefully curated for your convenience.'
        ]
      };

      // Get dynamic fields from JSON field or provide defaults
      const basicData = property.basicDynamicFields || [
        { key: 'Property Type', value: 'Apartment', id: '1' },
        { key: 'Status', value: 'Ready to Move', id: '2' }
      ];

      res.json({
        success: true,
        data: {
          buildingPermissionNumber: property.buildingPermissionNumber || '',
          reraNumber: property.reraNumber || '',
          reraWebsite: property.reraWebsite || '',
          basicData: basicData,
          sectionTitle: sectionData.sectionTitle || '',
          sectionTexts: sectionData.sectionTexts || ['']
        }
      });
    } catch (error) {
      console.error('Error fetching property basic info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch basic info'
      });
    }
  }

  async updatePropertyBasicInfo(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { 
        buildingPermissionNumber, 
        reraNumber, 
        reraWebsite, 
        basicData, 
        sectionTitle, 
        sectionTexts 
      } = req.body;

      const property = await Property.findByPk(id);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Validate required fields
      if (!buildingPermissionNumber?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Building Permission Number is required'
        });
      }

      if (!reraNumber?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'RERA Number is required'
        });
      }

      if (!reraWebsite?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'RERA Website is required'
        });
      }

      // Validate URL format
      try {
        new URL(reraWebsite);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid URL for RERA Website'
        });
      }

      // Prepare section data
      const sectionData = {
        sectionTitle: sectionTitle?.trim() || '',
        sectionTexts: Array.isArray(sectionTexts) ? sectionTexts.filter(text => text?.trim()) : []
      };

      // Prepare dynamic fields data - filter out empty entries
      const dynamicFields = Array.isArray(basicData) ? 
        basicData.filter(item => item?.key?.trim() && item?.value?.trim()) : [];

      // Update property with all basic info including JSON data
      await property.update({
        buildingPermissionNumber: buildingPermissionNumber.trim(),
        reraNumber: reraNumber.trim(),
        reraWebsite: reraWebsite.trim(),
        basicSectionData: sectionData,
        basicDynamicFields: dynamicFields
      });

      res.json({
        success: true,
        message: 'Basic information updated successfully',
        data: {
          buildingPermissionNumber: property.buildingPermissionNumber,
          reraNumber: property.reraNumber,
          reraWebsite: property.reraWebsite,
          basicData: dynamicFields,
          sectionTitle: sectionData.sectionTitle,
          sectionTexts: sectionData.sectionTexts
        }
      });
    } catch (error) {
      console.error('Error updating property basic info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update basic info'
      });
    }
  }

  // Highlights methods
  async getPropertyHighlights(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const property = await Property.findByPk(id, {
        attributes: [
          'id', 'name', 'highlightsSectionData', 'highlightsDynamicFields'
        ]
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Get section data from JSON field or provide defaults
      const sectionData = property.highlightsSectionData || {
        sectionTitle: 'Property Highlights',
        sectionTexts: [
          'Explore the premium features that set this property apart.',
          'Every highlight is designed to enhance your living experience.'
        ]
      };

      // Get dynamic fields from JSON field or provide defaults
      const highlightsData = property.highlightsDynamicFields || [
        { key: 'Parking', value: 'Covered Parking', id: '1' },
        { key: 'Security', value: '24/7 Security', id: '2' }
      ];

      res.json({
        success: true,
        data: {
          highlightsData: highlightsData,
          sectionTitle: sectionData.sectionTitle || '',
          sectionTexts: sectionData.sectionTexts || ['']
        }
      });
    } catch (error) {
      console.error('Error fetching property highlights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch highlights'
      });
    }
  }

  async updatePropertyHighlights(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { 
        highlightsData, 
        sectionTitle, 
        sectionTexts 
      } = req.body;

      const property = await Property.findByPk(id);
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Prepare section data (no validation - all optional)
      const sectionData = {
        sectionTitle: sectionTitle?.trim() || '',
        sectionTexts: Array.isArray(sectionTexts) ? sectionTexts.filter(text => text?.trim()) : []
      };

      // Prepare dynamic fields data - filter out empty entries (no validation - all optional)
      const dynamicFields = Array.isArray(highlightsData) ? 
        highlightsData.filter(item => item?.key?.trim() && item?.value?.trim()) : [];

      // Update property with highlights data
      await property.update({
        highlightsSectionData: sectionData,
        highlightsDynamicFields: dynamicFields
      });

      res.json({
        success: true,
        message: 'Highlights updated successfully',
        data: {
          highlightsData: dynamicFields,
          sectionTitle: sectionData.sectionTitle,
          sectionTexts: sectionData.sectionTexts
        }
      });
    } catch (error) {
      console.error('Error updating property highlights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update highlights'
      });
    }
  }

  // Location Highlights methods
  async getPropertyLocationHighlightsAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      console.log('Fetching location highlights for property:', id);

      // Get all location highlights for this property with icon associations
      const highlights = await PropertyLocationHighlight.findAll({
        where: { propertyId: id },
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }],
        order: [['level', 'ASC'], ['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      console.log('Found highlights:', highlights.length);

      // Transform flat data into hierarchical structure
      const buildHierarchy = (items: any[], parentId: string | null = null): any[] => {
        return items
          .filter(item => item.parentId === parentId)
          .map(item => ({
            id: item.id,
            name: item.name,
            value: item.value,
            icon: item.iconId,
            iframeUrl: item.iframeUrl,
            iconData: item.icon ? {
              id: item.icon.id,
              fileName: item.icon.fileName,
              originalName: item.icon.originalName,
              fileUrl: item.icon.fileUrl,
              cdnUrl: item.icon.cdnUrl
            } : null,
            level: item.level,
            sortOrder: item.sortOrder || 0,
            children: buildHierarchy(items, item.id)
          }));
      };

      const hierarchicalData = buildHierarchy(highlights);

      res.json({
        success: true,
        data: hierarchicalData
      });
    } catch (error) {
      console.error('Error fetching property location highlights:', error);
      console.error('Error details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch location highlights',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createLocationHighlight(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { parentId, name, value, iconId, iframeUrl, level } = req.body;

      // Validate required fields based on level
      if (level === 1 || level === 2) {
        if (!name?.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Name is required for categories and sub-categories'
          });
        }
      } else if (level === 3) {
        if (!value?.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Value is required for location items'
          });
        }
      }

      // Validate level constraints
      if (level < 1 || level > 3) {
        return res.status(400).json({
          success: false,
          message: 'Level must be 1 (Primary), 2 (Secondary), or 3 (Value)'
        });
      }

      // Validate parent hierarchy
      if (level > 1 && !parentId) {
        return res.status(400).json({
          success: false,
          message: 'Parent ID is required for sub-categories and values'
        });
      }

      const highlight = await PropertyLocationHighlight.create({
        propertyId: id,
        parentId: parentId || null,
        name: name?.trim() || null,
        value: value?.trim() || null,
        iconId: iconId || null,
        iframeUrl: iframeUrl?.trim() || null,
        level
      });

      // Fetch the created item with icon data
      const createdHighlight = await PropertyLocationHighlight.findByPk(highlight.id, {
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Location highlight created successfully',
        data: {
          id: createdHighlight?.id,
          name: createdHighlight?.name,
          value: createdHighlight?.value,
          icon: createdHighlight?.iconId,
          iframeUrl: createdHighlight?.iframeUrl,
          iconData: createdHighlight?.icon ? {
            id: createdHighlight.icon.id,
            fileName: createdHighlight.icon.fileName,
            originalName: createdHighlight.icon.originalName,
            fileUrl: createdHighlight.icon.fileUrl,
            cdnUrl: createdHighlight.icon.cdnUrl
          } : null,
          level: createdHighlight?.level,
          parentId: createdHighlight?.parentId
        }
      });
    } catch (error) {
      console.error('Error creating location highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create location highlight'
      });
    }
  }

  async updateLocationHighlight(req: AuthRequest, res: Response) {
    try {
      const { id, highlightId } = req.params;
      const { name, value, iconId, iframeUrl } = req.body;

      const highlight = await PropertyLocationHighlight.findOne({
        where: { 
          id: highlightId,
          propertyId: id 
        }
      });

      if (!highlight) {
        return res.status(404).json({
          success: false,
          message: 'Location highlight not found'
        });
      }

      // Validate required fields based on level
      if ((highlight.level === 1 || highlight.level === 2) && !name?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name is required for categories and sub-categories'
        });
      } else if (highlight.level === 3 && !value?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Value is required for location items'
        });
      }

      await highlight.update({
        name: name?.trim() || null,
        value: value?.trim() || null,
        iconId: iconId || null,
        iframeUrl: iframeUrl?.trim() || null
      });

      // Fetch updated item with icon data
      const updatedHighlight = await PropertyLocationHighlight.findByPk(highlightId, {
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }]
      });

      res.json({
        success: true,
        message: 'Location highlight updated successfully',
        data: {
          id: updatedHighlight?.id,
          name: updatedHighlight?.name,
          value: updatedHighlight?.value,
          icon: updatedHighlight?.iconId,
          iframeUrl: updatedHighlight?.iframeUrl,
          iconData: updatedHighlight?.icon ? {
            id: updatedHighlight.icon.id,
            fileName: updatedHighlight.icon.fileName,
            originalName: updatedHighlight.icon.originalName,
            fileUrl: updatedHighlight.icon.fileUrl,
            cdnUrl: updatedHighlight.icon.cdnUrl
          } : null,
          level: updatedHighlight?.level
        }
      });
    } catch (error) {
      console.error('Error updating location highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update location highlight'
      });
    }
  }

  async deleteLocationHighlight(req: AuthRequest, res: Response) {
    try {
      const { id, highlightId } = req.params;

      const highlight = await PropertyLocationHighlight.findOne({
        where: { 
          id: highlightId,
          propertyId: id 
        }
      });

      if (!highlight) {
        return res.status(404).json({
          success: false,
          message: 'Location highlight not found'
        });
      }

      // Check if it has children (cascade delete will handle this, but we want to inform the user)
      const childCount = await PropertyLocationHighlight.count({
        where: { parentId: highlightId }
      });

      await highlight.destroy();

      const message = childCount > 0 
        ? `Location highlight and ${childCount} child item(s) deleted successfully`
        : 'Location highlight deleted successfully';

      res.json({
        success: true,
        message
      });
    } catch (error) {
      console.error('Error deleting location highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete location highlight'
      });
    }
  }

  // Amenities Highlights
  async getPropertyAmenitiesHighlights(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      console.log('Fetching amenities highlights for property:', id);

      // Get all amenities highlights for this property with icon associations
      const highlights = await PropertyAmenitiesHighlight.findAll({
        where: { propertyId: id },
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }],
        order: [['level', 'ASC'], ['created_at', 'ASC']]
      });

      console.log('Found amenities highlights:', highlights.length);

      // Transform flat data into hierarchical structure
      const buildHierarchy = (items: any[], parentId: string | null = null): any[] => {
        return items
          .filter(item => item.parentId === parentId)
          .map(item => ({
            id: item.id,
            name: item.name,
            value: item.value,
            icon: item.iconId,
            iframeUrl: item.iframeUrl,
            iconData: item.icon ? {
              id: item.icon.id,
              fileName: item.icon.fileName,
              originalName: item.icon.originalName,
              fileUrl: item.icon.fileUrl,
              cdnUrl: item.icon.cdnUrl
            } : null,
            level: item.level,
            children: buildHierarchy(items, item.id)
          }));
      };

      const hierarchicalData = buildHierarchy(highlights);

      res.json({
        success: true,
        data: hierarchicalData
      });
    } catch (error) {
      console.error('Error fetching property amenities highlights:', error);
      console.error('Error details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch amenities highlights',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createAmenitiesHighlight(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { parentId, name, value, iconId, level } = req.body;

      // Validate required fields based on level
      if (level === 1 || level === 2) {
        if (!name?.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Name is required for categories and sub-categories'
          });
        }
      } else if (level === 3) {
        if (!value?.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Value is required for amenity items'
          });
        }
      }

      // Validate level constraints
      if (level < 1 || level > 3) {
        return res.status(400).json({
          success: false,
          message: 'Level must be 1 (Primary), 2 (Secondary), or 3 (Value)'
        });
      }

      // Validate parent hierarchy
      if (level > 1 && !parentId) {
        return res.status(400).json({
          success: false,
          message: 'Parent ID is required for sub-categories and values'
        });
      }

      const highlight = await PropertyAmenitiesHighlight.create({
        propertyId: id,
        parentId: parentId || null,
        name: name?.trim() || null,
        value: value?.trim() || null,
        iconId: iconId || null,
        level
      });

      // Fetch the created item with icon data
      const createdHighlight = await PropertyAmenitiesHighlight.findByPk(highlight.id, {
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Amenities highlight created successfully',
        data: {
          id: createdHighlight?.id,
          name: createdHighlight?.name,
          value: createdHighlight?.value,
          icon: createdHighlight?.iconId,
          iconData: createdHighlight?.icon ? {
            id: createdHighlight.icon.id,
            fileName: createdHighlight.icon.fileName,
            originalName: createdHighlight.icon.originalName,
            fileUrl: createdHighlight.icon.fileUrl,
            cdnUrl: createdHighlight.icon.cdnUrl
          } : null,
          level: createdHighlight?.level,
          parentId: createdHighlight?.parentId
        }
      });
    } catch (error) {
      console.error('Error creating amenities highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create amenities highlight'
      });
    }
  }

  async updateAmenitiesHighlight(req: AuthRequest, res: Response) {
    try {
      const { id, highlightId } = req.params;
      const { name, value, iconId } = req.body;

      const highlight = await PropertyAmenitiesHighlight.findOne({
        where: { 
          id: highlightId,
          propertyId: id 
        }
      });

      if (!highlight) {
        return res.status(404).json({
          success: false,
          message: 'Amenities highlight not found'
        });
      }

      // Validate required fields based on level
      if ((highlight.level === 1 || highlight.level === 2) && !name?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name is required for categories and sub-categories'
        });
      } else if (highlight.level === 3 && !value?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Value is required for amenity items'
        });
      }

      await highlight.update({
        name: name?.trim() || null,
        value: value?.trim() || null,
        iconId: iconId || null
      });

      // Fetch updated item with icon data
      const updatedHighlight = await PropertyAmenitiesHighlight.findByPk(highlightId, {
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }]
      });

      res.json({
        success: true,
        message: 'Amenities highlight updated successfully',
        data: {
          id: updatedHighlight?.id,
          name: updatedHighlight?.name,
          value: updatedHighlight?.value,
          icon: updatedHighlight?.iconId,
          iconData: updatedHighlight?.icon ? {
            id: updatedHighlight.icon.id,
            fileName: updatedHighlight.icon.fileName,
            originalName: updatedHighlight.icon.originalName,
            fileUrl: updatedHighlight.icon.fileUrl,
            cdnUrl: updatedHighlight.icon.cdnUrl
          } : null,
          level: updatedHighlight?.level
        }
      });
    } catch (error) {
      console.error('Error updating amenities highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update amenities highlight'
      });
    }
  }

  async deleteAmenitiesHighlight(req: AuthRequest, res: Response) {
    try {
      const { id, highlightId } = req.params;

      const highlight = await PropertyAmenitiesHighlight.findOne({
        where: { 
          id: highlightId,
          propertyId: id 
        }
      });

      if (!highlight) {
        return res.status(404).json({
          success: false,
          message: 'Amenities highlight not found'
        });
      }

      // Check if it has children (cascade delete will handle this, but we want to inform the user)
      const childCount = await PropertyAmenitiesHighlight.count({
        where: { parentId: highlightId }
      });

      await highlight.destroy();

      const message = childCount > 0 
        ? `Amenities highlight and ${childCount} child item(s) deleted successfully`
        : 'Amenities highlight deleted successfully';

      res.json({
        success: true,
        message
      });
    } catch (error) {
      console.error('Error deleting amenities highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete amenities highlight'
      });
    }
  }

  // Overview Highlights
  async getPropertyOverviewHighlightsAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      console.log('Fetching overview highlights for property:', id);

      // Get all overview highlights for this property with icon associations
      const highlights = await PropertyOverviewHighlight.findAll({
        where: { propertyId: id },
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }],
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      console.log('Found overview highlights:', highlights.length);

      // Transform to simple flat structure (no hierarchy)
      const data = highlights.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.iconId,
        sortOrder: item.sortOrder || 0,
        iconData: item.icon ? {
          id: item.icon.id,
          fileName: item.icon.fileName,
          originalName: item.icon.originalName,
          fileUrl: item.icon.fileUrl,
          cdnUrl: item.icon.cdnUrl
        } : null
      }));

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching property overview highlights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overview highlights',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createOverviewHighlight(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, iconId } = req.body;

      // Validate required fields
      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      const highlight = await PropertyOverviewHighlight.create({
        propertyId: id,
        name: name.trim(),
        iconId: iconId || null
      });

      // Fetch the created highlight with icon data
      const createdHighlight = await PropertyOverviewHighlight.findByPk(highlight.id, {
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Overview highlight created successfully',
        data: {
          id: createdHighlight!.id,
          name: createdHighlight!.name,
          icon: createdHighlight!.iconId,
          iconData: createdHighlight!.icon ? {
            id: createdHighlight!.icon.id,
            fileName: createdHighlight!.icon.fileName,
            originalName: createdHighlight!.icon.originalName,
            fileUrl: createdHighlight!.icon.fileUrl,
            cdnUrl: createdHighlight!.icon.cdnUrl
          } : null
        }
      });
    } catch (error) {
      console.error('Error creating overview highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create overview highlight'
      });
    }
  }

  async updateOverviewHighlight(req: AuthRequest, res: Response) {
    try {
      const { id, highlightId } = req.params;
      const { name, iconId } = req.body;

      // Validate required fields
      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      const highlight = await PropertyOverviewHighlight.findOne({
        where: { 
          id: highlightId,
          propertyId: id 
        }
      });

      if (!highlight) {
        return res.status(404).json({
          success: false,
          message: 'Overview highlight not found'
        });
      }

      await highlight.update({
        name: name.trim(),
        iconId: iconId || null
      });

      // Fetch updated highlight with icon data
      const updatedHighlight = await PropertyOverviewHighlight.findByPk(highlightId, {
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }]
      });

      res.json({
        success: true,
        message: 'Overview highlight updated successfully',
        data: {
          id: updatedHighlight!.id,
          name: updatedHighlight!.name,
          icon: updatedHighlight!.iconId,
          iconData: updatedHighlight!.icon ? {
            id: updatedHighlight!.icon.id,
            fileName: updatedHighlight!.icon.fileName,
            originalName: updatedHighlight!.icon.originalName,
            fileUrl: updatedHighlight!.icon.fileUrl,
            cdnUrl: updatedHighlight!.icon.cdnUrl
          } : null
        }
      });
    } catch (error) {
      console.error('Error updating overview highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update overview highlight'
      });
    }
  }

  async deleteOverviewHighlight(req: AuthRequest, res: Response) {
    try {
      const { id, highlightId } = req.params;

      const highlight = await PropertyOverviewHighlight.findOne({
        where: { 
          id: highlightId,
          propertyId: id 
        }
      });

      if (!highlight) {
        return res.status(404).json({
          success: false,
          message: 'Overview highlight not found'
        });
      }

      await highlight.destroy();

      res.json({
        success: true,
        message: 'Overview highlight deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting overview highlight:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete overview highlight'
      });
    }
  }

  // Reorder overview highlights
  async reorderOverviewHighlights(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { highlightOrder } = req.body;

      console.log('Reorder request received:', {
        propertyId: id,
        highlightOrder: highlightOrder,
        bodyKeys: Object.keys(req.body)
      });

      if (!Array.isArray(highlightOrder) || highlightOrder.length === 0) {
        console.log('Validation failed:', { 
          isArray: Array.isArray(highlightOrder), 
          length: highlightOrder?.length,
          highlightOrder 
        });
        return res.status(400).json({
          success: false,
          message: 'Highlight order array is required'
        });
      }

      // Validate that all highlights belong to the property
      const highlightIds = highlightOrder.map(item => item.id);
      const highlights = await PropertyOverviewHighlight.findAll({
        where: {
          id: highlightIds,
          propertyId: id
        }
      });

      if (highlights.length !== highlightIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some highlights do not exist or do not belong to this property'
        });
      }

      // Update sort order for each highlight
      const updatePromises = highlightOrder.map(item =>
        PropertyOverviewHighlight.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id, propertyId: id } }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Overview highlights reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering overview highlights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder overview highlights'
      });
    }
  }

  // Videos
  async getPropertyVideos(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      console.log('Fetching videos for property:', id);

      const property = await Property.findByPk(id, {
        attributes: ['videos']
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const videos = property.videos || [];

      res.json({
        success: true,
        data: { videos }
      });
    } catch (error) {
      console.error('Error fetching property videos:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch videos',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updatePropertyVideos(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { videos } = req.body;

      // Validate videos array
      if (!Array.isArray(videos)) {
        return res.status(400).json({
          success: false,
          message: 'Videos must be an array'
        });
      }

      // Validate each video object
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (!video.url || !video.title) {
          return res.status(400).json({
            success: false,
            message: `Video ${i + 1}: URL and title are required`
          });
        }

        if (typeof video.url !== 'string' || typeof video.title !== 'string') {
          return res.status(400).json({
            success: false,
            message: `Video ${i + 1}: URL and title must be strings`
          });
        }

        // Basic YouTube URL validation
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        if (!youtubeRegex.test(video.url.trim())) {
          return res.status(400).json({
            success: false,
            message: `Video ${i + 1}: Please provide a valid YouTube URL`
          });
        }
      }

      const property = await Property.findByPk(id);

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Generate IDs for videos that don't have them
      const videosWithIds = videos.map(video => ({
        ...video,
        id: video.id || `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: video.url.trim(),
        title: video.title.trim()
      }));

      await property.update({
        videos: videosWithIds
      });

      res.json({
        success: true,
        message: 'Videos updated successfully',
        data: { videos: videosWithIds }
      });
    } catch (error) {
      console.error('Error updating property videos:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update videos',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Text Components
  async getPropertyTextComponents(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      console.log('Fetching text components for property:', id);

      const textComponents = await PropertyTextComponent.findAll({
        where: { propertyId: id },
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }],
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      console.log('Found text components:', textComponents.length);

      const formattedComponents = textComponents.map(component => ({
        id: component.id,
        title: component.title,
        content: component.content,
        icon: component.iconId,
        iconData: component.icon ? {
          id: component.icon.id,
          fileName: component.icon.fileName,
          originalName: component.icon.originalName,
          fileUrl: component.icon.fileUrl,
          cdnUrl: component.icon.cdnUrl
        } : null,
        sortOrder: component.sortOrder,
        isActive: component.isActive
      }));

      res.json({
        success: true,
        data: formattedComponents
      });
    } catch (error) {
      console.error('Error fetching property text components:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch text components',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createTextComponent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, content, iconId, sortOrder, isActive } = req.body;

      // Validate required fields
      if (!content?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        });
      }

      // Get the next sort order if not provided
      let finalSortOrder = sortOrder;
      if (finalSortOrder === undefined || finalSortOrder === null) {
        const maxOrder = await PropertyTextComponent.max('sortOrder', {
          where: { propertyId: id }
        });
        finalSortOrder = ((maxOrder as number) || 0) + 1;
      }

      const textComponent = await PropertyTextComponent.create({
        propertyId: id,
        title: title?.trim() || null,
        content: content.trim(),
        iconId: iconId || null,
        sortOrder: finalSortOrder,
        isActive: isActive !== undefined ? isActive : true
      });

      // Fetch the created item with icon data
      const createdComponent = await PropertyTextComponent.findByPk(textComponent.id, {
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Text component created successfully',
        data: {
          id: createdComponent?.id,
          title: createdComponent?.title,
          content: createdComponent?.content,
          icon: createdComponent?.iconId,
          iconData: createdComponent?.icon ? {
            id: createdComponent.icon.id,
            fileName: createdComponent.icon.fileName,
            originalName: createdComponent.icon.originalName,
            fileUrl: createdComponent.icon.fileUrl,
            cdnUrl: createdComponent.icon.cdnUrl
          } : null,
          sortOrder: createdComponent?.sortOrder,
          isActive: createdComponent?.isActive
        }
      });
    } catch (error) {
      console.error('Error creating text component:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create text component'
      });
    }
  }

  async updateTextComponent(req: AuthRequest, res: Response) {
    try {
      const { id, componentId } = req.params;
      const { title, content, iconId, sortOrder, isActive } = req.body;

      const textComponent = await PropertyTextComponent.findOne({
        where: { 
          id: componentId,
          propertyId: id 
        }
      });

      if (!textComponent) {
        return res.status(404).json({
          success: false,
          message: 'Text component not found'
        });
      }

      // Validate required fields
      if (content !== undefined && !content?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Content cannot be empty'
        });
      }

      await textComponent.update({
        title: title !== undefined ? (title?.trim() || null) : textComponent.title,
        content: content !== undefined ? content.trim() : textComponent.content,
        iconId: iconId !== undefined ? (iconId || null) : textComponent.iconId,
        sortOrder: sortOrder !== undefined ? sortOrder : textComponent.sortOrder,
        isActive: isActive !== undefined ? isActive : textComponent.isActive
      });

      // Fetch updated item with icon data
      const updatedComponent = await PropertyTextComponent.findByPk(componentId, {
        include: [{
          model: MediaFile,
          as: 'icon',
          required: false
        }]
      });

      res.json({
        success: true,
        message: 'Text component updated successfully',
        data: {
          id: updatedComponent?.id,
          title: updatedComponent?.title,
          content: updatedComponent?.content,
          icon: updatedComponent?.iconId,
          iconData: updatedComponent?.icon ? {
            id: updatedComponent.icon.id,
            fileName: updatedComponent.icon.fileName,
            originalName: updatedComponent.icon.originalName,
            fileUrl: updatedComponent.icon.fileUrl,
            cdnUrl: updatedComponent.icon.cdnUrl
          } : null,
          sortOrder: updatedComponent?.sortOrder,
          isActive: updatedComponent?.isActive
        }
      });
    } catch (error) {
      console.error('Error updating text component:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update text component'
      });
    }
  }

  async deleteTextComponent(req: AuthRequest, res: Response) {
    try {
      const { id, componentId } = req.params;

      const textComponent = await PropertyTextComponent.findOne({
        where: { 
          id: componentId,
          propertyId: id 
        }
      });

      if (!textComponent) {
        return res.status(404).json({
          success: false,
          message: 'Text component not found'
        });
      }

      await textComponent.destroy();

      res.json({
        success: true,
        message: 'Text component deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting text component:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete text component'
      });
    }
  }

  async reorderTextComponents(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { componentIds } = req.body;

      if (!componentIds || !Array.isArray(componentIds)) {
        return res.status(400).json({
          success: false,
          message: 'Component IDs array is required'
        });
      }

      // Update sort order for each component
      const updatePromises = componentIds.map((componentId: string, index: number) =>
        PropertyTextComponent.update(
          { sortOrder: index + 1 },
          { 
            where: { 
              id: componentId,
              propertyId: id 
            }
          }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Text components reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering text components:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder text components'
      });
    }
  }

  // Banner Carousel Methods
  async getBannerCarouselImages(req: AuthRequest, res: Response) {
    try {
      const { id, type } = req.params;
      
      if (!['desktop', 'mobile'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid carousel type. Must be desktop or mobile'
        });
      }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Get carousel images for the specified type using componentType
      const images = await PropertyImage.findAll({
        where: {
          propertyId: id,
          componentType: type === 'desktop' ? 'banner-carousel-desktop' : 'banner-carousel-mobile',
          isActive: true
        },
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      const formattedImages = images.map((img, index) => ({
        id: img.id,
        fileName: img.fileName,
        originalName: img.originalName,
        fileUrl: img.fileUrl,
        cdnUrl: img.cdnUrl,
        altText: img.altText,
        title: img.title,
        description: img.description,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
        sortOrder: img.sortOrder || index + 1,
        isActive: img.isActive
      }));

      res.json({
        success: true,
        data: formattedImages
      });
    } catch (error) {
      console.error('Error fetching banner carousel images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch banner carousel images'
      });
    }
  }

  async uploadBannerCarouselImages(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { type } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      if (!['desktop', 'mobile'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid carousel type. Must be desktop or mobile'
        });
      }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Get current max sort order
      const maxSortOrder = (await PropertyImage.max('sortOrder', {
        where: {
          propertyId: id,
          filePath: {
            [Op.like]: `%carousel-${type}%`
          }
        }
      }) as number) || 0;

      // Upload files to Digital Ocean Spaces with custom naming
      const uploadedImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload with custom carousel filename
        const uploadResult = await uploadFile(
          file,
          file.originalname,
          {
            folder: MediaFolder.PROJECTS,
            projectId: id,
            fileName: `carousel-${type}-${Date.now()}-${i}-${file.originalname}`,
            isPublic: true,
            metadata: {
              'file-type': `carousel-${type}`,
              'property-id': id,
              'upload-timestamp': new Date().toISOString()
            }
          }
        );
        
        const propertyImage = await PropertyImage.create({
          propertyId: id,
          fileName: uploadResult.key.split('/').pop() || file.originalname,
          originalName: file.originalname,
          filePath: uploadResult.key,
          fileUrl: uploadResult.url,
          cdnUrl: uploadResult.cdnUrl,
          altText: `${property.name} ${type} carousel image`,
          fileSize: uploadResult.size,
          mimeType: uploadResult.mimeType,
          componentType: type === 'desktop' ? 'banner-carousel-desktop' : 'banner-carousel-mobile',
          sortOrder: maxSortOrder + i + 1,
          isPrimary: false,
          isActive: true
        });

        uploadedImages.push({
          id: propertyImage.id,
          fileName: propertyImage.fileName,
          originalName: propertyImage.originalName,
          fileUrl: propertyImage.fileUrl,
          cdnUrl: propertyImage.cdnUrl,
          altText: propertyImage.altText,
          fileSize: propertyImage.fileSize,
          mimeType: propertyImage.mimeType,
          sortOrder: propertyImage.sortOrder,
          isActive: propertyImage.isActive
        });
      }

      res.json({
        success: true,
        data: uploadedImages,
        message: `${uploadedImages.length} images uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading banner carousel images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload banner carousel images'
      });
    }
  }

  async updateBannerCarouselOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { orderData, type } = req.body;

      if (!['desktop', 'mobile'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid carousel type. Must be desktop or mobile'
        });
      }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Update sort orders
      const updatePromises = orderData.map((item: { id: string; sortOrder: number }) =>
        PropertyImage.update(
          { sortOrder: item.sortOrder },
          {
            where: {
              id: item.id,
              propertyId: id,
              componentType: type === 'desktop' ? 'banner-carousel-desktop' : 'banner-carousel-mobile'
            }
          }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Banner carousel order updated successfully'
      });
    } catch (error) {
      console.error('Error updating banner carousel order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update banner carousel order'
      });
    }
  }

  async updateBannerCarouselImage(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;
      const { isActive, altText, title, description, type } = req.body;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const updateData: any = {};
      if (isActive !== undefined) updateData.isActive = isActive;
      if (altText !== undefined) updateData.altText = altText;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;

      const whereImage: any = {
        id: imageId,
        propertyId: id
      };

      if (type) {
        whereImage.filePath = {
          [Op.like]: `%carousel-${type}%`
        };
      }

      const [updated] = await PropertyImage.update(updateData, {
        where: whereImage
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Banner carousel image not found'
        });
      }

      res.json({
        success: true,
        message: 'Banner carousel image updated successfully'
      });
    } catch (error) {
      console.error('Error updating banner carousel image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update banner carousel image'
      });
    }
  }

  async deleteBannerCarouselImage(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;
      const { type } = req.query;

      if (!type || !['desktop', 'mobile'].includes(type as string)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid carousel type. Must be desktop or mobile'
        });
      }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Find the image
      const image = await PropertyImage.findOne({
        where: {
          id: imageId,
          propertyId: property.id,
          componentType: type === 'desktop' ? 'banner-carousel-desktop' : 'banner-carousel-mobile'
        }
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Banner carousel image not found'
        });
      }

      // Delete the PropertyImage entry (this will cascade delete the MediaFile if configured)
      await image.destroy();

      res.json({
        success: true,
        message: 'Banner carousel image deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting banner carousel image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete banner carousel image'
      });
    }
  }

  // Video Testimonials methods
  async getPropertyVideoTestimonials(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        include: [{
          model: PropertyVideoTestimonial,
          as: 'videoTestimonials',
          where: { isActive: true },
          required: false,
          order: [['sortOrder', 'ASC']]
        }]
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      res.json({
        success: true,
        data: property.videoTestimonials || []
      });
    } catch (error) {
      console.error('Error fetching property video testimonials:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video testimonials'
      });
    }
  }

  async createVideoTestimonial(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { customerName, designation, testimonialText, youtubeUrl, rating } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Get the max sort order
      const maxSortOrder = (await PropertyVideoTestimonial.max('sortOrder', {
        where: { propertyId: id }
      }) as number) || 0;

      const testimonial = await PropertyVideoTestimonial.create({
        propertyId: id,
        customerName,
        designation,
        testimonialText,
        youtubeUrl,
        rating,
        sortOrder: maxSortOrder + 1
      });

      res.json({
        success: true,
        message: 'Video testimonial created successfully',
        data: testimonial
      });
    } catch (error) {
      console.error('Error creating video testimonial:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create video testimonial'
      });
    }
  }

  async updateVideoTestimonial(req: AuthRequest, res: Response) {
    try {
      const { id, testimonialId } = req.params;
      const { customerName, designation, testimonialText, youtubeUrl, rating, isActive } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const testimonial = await PropertyVideoTestimonial.findOne({
        where: {
          id: testimonialId,
          propertyId: id
        }
      });

      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: 'Video testimonial not found'
        });
      }

      await testimonial.update({
        ...(customerName !== undefined && { customerName }),
        ...(designation !== undefined && { designation }),
        ...(testimonialText !== undefined && { testimonialText }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
        ...(rating !== undefined && { rating }),
        ...(isActive !== undefined && { isActive })
      });

      res.json({
        success: true,
        message: 'Video testimonial updated successfully',
        data: testimonial
      });
    } catch (error) {
      console.error('Error updating video testimonial:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update video testimonial'
      });
    }
  }

  async deleteVideoTestimonial(req: AuthRequest, res: Response) {
    try {
      const { id, testimonialId } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const testimonial = await PropertyVideoTestimonial.findOne({
        where: {
          id: testimonialId,
          propertyId: id
        }
      });

      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: 'Video testimonial not found'
        });
      }

      await testimonial.destroy();

      res.json({
        success: true,
        message: 'Video testimonial deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting video testimonial:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete video testimonial'
      });
    }
  }

  async updateVideoTestimonialOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { testimonialOrder } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Update sort order for each testimonial
      const updatePromises = testimonialOrder.map((item: { id: string; sortOrder: number }) => 
        PropertyVideoTestimonial.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id, propertyId: id } }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Video testimonial order updated successfully'
      });
    } catch (error) {
      console.error('Error updating video testimonial order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update video testimonial order'
      });
    }
  }

  // Video Banner methods
  async getPropertyVideoBanner(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'name', 'videoBannerUrl', 'videoBannerTitle', 'videoBannerDescription']
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      res.json({
        success: true,
        data: {
          videoBannerUrl: property.videoBannerUrl,
          videoBannerTitle: property.videoBannerTitle,
          videoBannerDescription: property.videoBannerDescription
        }
      });
    } catch (error) {
      console.error('Error fetching property video banner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch video banner'
      });
    }
  }

  async updatePropertyVideoBanner(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { videoBannerUrl, videoBannerTitle, videoBannerDescription } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      await property.update({
        videoBannerUrl,
        videoBannerTitle,
        videoBannerDescription
      });

      res.json({
        success: true,
        message: 'Video banner updated successfully',
        data: {
          videoBannerUrl: property.videoBannerUrl,
          videoBannerTitle: property.videoBannerTitle,
          videoBannerDescription: property.videoBannerDescription
        }
      });
    } catch (error) {
      console.error('Error updating video banner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update video banner'
      });
    }
  }

  async deletePropertyVideoBanner(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      await property.update({
        videoBannerUrl: undefined,
        videoBannerTitle: undefined,
        videoBannerDescription: undefined
      });

      res.json({
        success: true,
        message: 'Video banner deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting video banner:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete video banner'
      });
    }
  }

  // FAQ methods
  async getPropertyFAQsAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'clientId']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const faqs = await Faq.findAll({
        where: {
          propertyId: property.id,
          clientId: property.clientId
        },
        attributes: [
          'id', 
          'question', 
          'answer', 
          'sortOrder', 
          'isActive'
        ],
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
      });

      res.json({ success: true, data: { faqs } });
    } catch (error) {
      console.error('Error fetching property FAQs:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property FAQs' });
    }
  }

  async createPropertyFAQ(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { question, answer, isActive = true, sortOrder = 0 } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'clientId']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Get the first available category for this client
      const defaultCategory = await FaqCategory.findOne({
        where: { clientId: property.clientId, isActive: true },
        attributes: ['id'],
        order: [['sortOrder', 'ASC']]
      });

      if (!defaultCategory) {
        return res.status(400).json({ 
          success: false, 
          message: 'No FAQ category found for this client. Please create a category first.' 
        });
      }

      const faq = await Faq.create({
        clientId: property.clientId,
        categoryId: defaultCategory.id,
        propertyId: property.id,
        question,
        answer,
        isActive,
        isPublished: isActive, // Keep both fields in sync for now
        sortOrder,
        viewCount: 0,
        isHelpful: 0,
        isNotHelpful: 0
      });

      res.status(201).json({ 
        success: true, 
        message: 'FAQ created successfully',
        data: {
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          isActive: faq.isActive,
          sortOrder: faq.sortOrder
        }
      });
    } catch (error) {
      console.error('Error creating property FAQ:', error);
      res.status(500).json({ success: false, message: 'Failed to create property FAQ' });
    }
  }

  async updatePropertyFAQ(req: AuthRequest, res: Response) {
    try {
      const { id, faqId } = req.params;
      const { question, answer, sortOrder, isActive } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'clientId']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const faq = await Faq.findOne({
        where: {
          id: faqId,
          propertyId: property.id,
          clientId: property.clientId
        }
      });

      if (!faq) {
        return res.status(404).json({ success: false, message: 'FAQ not found' });
      }

      const updateData: any = {};
      if (question !== undefined) updateData.question = question;
      if (answer !== undefined) updateData.answer = answer;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (isActive !== undefined) {
        updateData.isActive = isActive;
        updateData.isPublished = isActive; // Keep both fields in sync
      }

      await faq.update(updateData);

      res.json({ 
        success: true, 
        message: 'FAQ updated successfully',
        data: {
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          isActive: faq.isActive,
          sortOrder: faq.sortOrder
        }
      });
    } catch (error) {
      console.error('Error updating property FAQ:', error);
      res.status(500).json({ success: false, message: 'Failed to update property FAQ' });
    }
  }

  async deletePropertyFAQ(req: AuthRequest, res: Response) {
    try {
      const { id, faqId } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'clientId']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const faq = await Faq.findOne({
        where: {
          id: faqId,
          propertyId: property.id,
          clientId: property.clientId
        }
      });

      if (!faq) {
        return res.status(404).json({ success: false, message: 'FAQ not found' });
      }

      await faq.destroy();

      res.json({ 
        success: true, 
        message: 'FAQ deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting property FAQ:', error);
      res.status(500).json({ success: false, message: 'Failed to delete property FAQ' });
    }
  }

  async reorderPropertyFAQs(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { faqOrder } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'clientId']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Update sort order for each FAQ
      for (const item of faqOrder) {
        await Faq.update(
          { sortOrder: item.sortOrder },
          {
            where: {
              id: item.id,
              propertyId: property.id,
              clientId: property.clientId
            }
          }
        );
      }

      res.json({ 
        success: true, 
        message: 'FAQ order updated successfully'
      });
    } catch (error) {
      console.error('Error reordering property FAQs:', error);
      res.status(500).json({ success: false, message: 'Failed to reorder property FAQs' });
    }
  }

  // Public FAQ endpoint
  async getPropertyFAQs(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = `property:${clientId}:${slug}:faqs`;

      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      // Find property first to get ID
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Get published and active FAQs
      const faqs = await Faq.findAll({
        where: {
          propertyId: property.id,
          clientId,
          isPublished: true,
          isActive: true
        },
        attributes: [
          'id', 
          'question', 
          'answer', 
          'sortOrder',
          'viewCount',
          'isHelpful',
          'isNotHelpful'
        ],
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
      });

      // Cache for 10 minutes
      await CacheService.set(cacheKey, faqs, 600);

      res.json({ success: true, data: faqs });
    } catch (error) {
      console.error('Error fetching property FAQs:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property FAQs' });
    }
  }

  // SEO Metadata methods
  async getPropertySEOAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'clientId', 'slug']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const seoMetadata = await SeoMetadata.findOne({
        where: {
          entityType: 'property',
          entityId: property.id,
          clientId: property.clientId
        }
      });

      res.json({ 
        success: true, 
        data: seoMetadata || {
          entityType: 'property',
          entityId: property.id,
          clientId: property.clientId,
          urlPath: `/properties/${property.slug}`,
          pageType: 'property_detail'
        }
      });
    } catch (error) {
      console.error('Error fetching property SEO metadata:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property SEO metadata' });
    }
  }

  async updatePropertySEO(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        metaTitle,
        metaDescription,
        metaKeywords,
        ogTitle,
        ogDescription,
        ogImage,
        ogUrl,
        ogType,
        twitterTitle,
        twitterDescription,
        twitterImage,
        twitterCard,
        schemaMarkup,
        canonicalUrl,
        robots,
        priority,
        changeFrequency,
        isActive
      } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'clientId', 'slug']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const urlPath = `/properties/${property.slug}`;

      const seoData: any = {
        entityType: 'property',
        entityId: property.id,
        clientId: property.clientId,
        pageType: 'property_detail',
        urlPath
      };

      // Helper function to convert empty strings to null
      const emptyToNull = (value: any) => value === '' ? null : value;

      if (metaTitle !== undefined) seoData.metaTitle = emptyToNull(metaTitle);
      if (metaDescription !== undefined) seoData.metaDescription = emptyToNull(metaDescription);
      if (metaKeywords !== undefined) seoData.metaKeywords = emptyToNull(metaKeywords);
      if (ogTitle !== undefined) seoData.ogTitle = emptyToNull(ogTitle);
      if (ogDescription !== undefined) seoData.ogDescription = emptyToNull(ogDescription);
      if (ogImage !== undefined) seoData.ogImage = emptyToNull(ogImage);
      if (ogUrl !== undefined) seoData.ogUrl = emptyToNull(ogUrl);
      if (ogType !== undefined) seoData.ogType = emptyToNull(ogType);
      if (twitterTitle !== undefined) seoData.twitterTitle = emptyToNull(twitterTitle);
      if (twitterDescription !== undefined) seoData.twitterDescription = emptyToNull(twitterDescription);
      if (twitterImage !== undefined) seoData.twitterImage = emptyToNull(twitterImage);
      if (twitterCard !== undefined) seoData.twitterCard = emptyToNull(twitterCard);
      if (schemaMarkup !== undefined) seoData.schemaMarkup = schemaMarkup;
      if (canonicalUrl !== undefined) seoData.canonicalUrl = emptyToNull(canonicalUrl);
      if (robots !== undefined) seoData.robots = emptyToNull(robots);
      if (priority !== undefined) seoData.priority = priority;
      if (changeFrequency !== undefined) seoData.changeFrequency = changeFrequency;
      if (isActive !== undefined) seoData.isActive = isActive;

      const [seoMetadata, created] = await SeoMetadata.upsert(seoData, {
        returning: true
      });

      res.json({ 
        success: true, 
        message: created ? 'SEO metadata created successfully' : 'SEO metadata updated successfully',
        data: seoMetadata
      });
    } catch (error) {
      console.error('Error updating property SEO metadata:', error);
      res.status(500).json({ success: false, message: 'Failed to update property SEO metadata' });
    }
  }

  async deletePropertySEO(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'clientId']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const seoMetadata = await SeoMetadata.findOne({
        where: {
          entityType: 'property',
          entityId: property.id,
          clientId: property.clientId
        }
      });

      if (!seoMetadata) {
        return res.status(404).json({ success: false, message: 'SEO metadata not found' });
      }

      await seoMetadata.destroy();

      res.json({ 
        success: true, 
        message: 'SEO metadata deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting property SEO metadata:', error);
      res.status(500).json({ success: false, message: 'Failed to delete property SEO metadata' });
    }
  }

  // Public SEO endpoint
  async getPropertySEO(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = `property:${clientId}:${slug}:seo`;

      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      // Find property first to get ID
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id', 'name', 'description']
      });

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Get SEO metadata
      const seoMetadata = await SeoMetadata.findOne({
        where: {
          entityType: 'property',
          entityId: property.id,
          clientId,
          isActive: true
        },
        attributes: [
          'metaTitle',
          'metaDescription', 
          'metaKeywords',
          'ogTitle',
          'ogDescription',
          'ogImage',
          'ogUrl',
          'ogType',
          'twitterTitle',
          'twitterDescription',
          'twitterImage',
          'twitterCard',
          'schemaMarkup',
          'canonicalUrl',
          'robots'
        ]
      });

      // Generate default SEO data if no custom metadata exists
      const seoData = seoMetadata ? seoMetadata.toJSON() : {
        metaTitle: property.name,
        metaDescription: property.description ? property.description.substring(0, 160) : `Property details for ${property.name}`,
        ogTitle: property.name,
        ogDescription: property.description ? property.description.substring(0, 300) : `Property details for ${property.name}`,
        ogType: 'website',
        twitterCard: 'summary_large_image',
        robots: 'index, follow'
      };

      // Cache for 15 minutes
      await CacheService.set(cacheKey, seoData, 900);

      res.json({ success: true, data: seoData });
    } catch (error) {
      console.error('Error fetching property SEO metadata:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch property SEO metadata' });
    }
  }

  // Simplified delete method for any PropertyImage - just needs image ID
  async deletePropertyImage(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const image = await PropertyImage.findOne({
        where: { 
          id: imageId, 
          propertyId: property.id,
          isActive: true 
        }
      });
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      // Soft delete the image
      await image.update({ isActive: false });

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting property image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  }

  // Public videos endpoint (client API)
  async getPropertyVideosBySlug(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = `property:${clientId}:${slug}:videos`;
      
      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }
      
      // Find property first to get videos
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id', 'videos']
      });
      
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      
      const videos = property.videos || [];
      
      // Cache for 5 minutes
      await CacheService.set(cacheKey, { videos }, 300);
      
      res.json({ 
        success: true, 
        data: { videos }
      });
    } catch (error) {
      console.error('Error fetching property videos:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch property videos' 
      });
    }
  }

  // ============ PROPERTY REVIEWS ADMIN METHODS ============

  // Get all reviews for a property (Admin)
  async getPropertyReviewsAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ 
        where,
        attributes: ['id', 'name']
      });
      
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      
      const reviews = await PropertyReview.findAll({
        where: { propertyId: property.id },
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        attributes: [
          'id', 'customerName', 'designation', 'reviewText', 'rating',
          'customerPhotoUrl', 'customerPhotoAlt', 'sortOrder', 
          'isActive', 'isFeatured', 'createdAt'
        ]
      });
      
      res.json({ 
        success: true, 
        data: { reviews }
      });
    } catch (error) {
      console.error('Error fetching property reviews:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch reviews' 
      });
    }
  }

  // Create a new review (Admin)
  async createPropertyReview(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { 
        customerName, 
        designation, 
        reviewText, 
        rating, 
        customerPhotoAlt,
        isActive = true,
        isFeatured = false
      } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      
      // Get the next sort order
      const maxSortOrder = await PropertyReview.max('sortOrder', {
        where: { propertyId: property.id }
      }) as number;
      
      const sortOrder = (maxSortOrder || 0) + 1;
      
      const review = await PropertyReview.create({
        propertyId: property.id,
        customerName: customerName.trim(),
        designation: designation?.trim(),
        reviewText: reviewText.trim(),
        rating,
        customerPhotoAlt: customerPhotoAlt?.trim(),
        sortOrder,
        isActive,
        isFeatured
      });
      
      res.status(201).json({ 
        success: true, 
        message: 'Review created successfully',
        data: review
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create review' 
      });
    }
  }

  // Update a review (Admin)
  async updatePropertyReview(req: AuthRequest, res: Response) {
    try {
      const { id, reviewId } = req.params;
      const { 
        customerName, 
        designation, 
        reviewText, 
        rating, 
        customerPhotoAlt,
        isActive,
        isFeatured
      } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      
      const review = await PropertyReview.findOne({
        where: { id: reviewId, propertyId: property.id }
      });
      
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      
      const updateData: any = {};
      if (customerName !== undefined) updateData.customerName = customerName.trim();
      if (designation !== undefined) updateData.designation = designation?.trim();
      if (reviewText !== undefined) updateData.reviewText = reviewText.trim();
      if (rating !== undefined) updateData.rating = rating;
      if (customerPhotoAlt !== undefined) updateData.customerPhotoAlt = customerPhotoAlt?.trim();
      if (isActive !== undefined) updateData.isActive = isActive;
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
      
      await review.update(updateData);
      
      res.json({ 
        success: true, 
        message: 'Review updated successfully',
        data: review
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update review' 
      });
    }
  }

  // Delete a review (Admin)
  async deletePropertyReview(req: AuthRequest, res: Response) {
    try {
      const { id, reviewId } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      
      const review = await PropertyReview.findOne({
        where: { id: reviewId, propertyId: property.id }
      });
      
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      
      await review.destroy();
      
      res.json({ 
        success: true, 
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete review' 
      });
    }
  }

  // Reorder reviews (Admin)
  async reorderPropertyReviews(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reviewOrder } = req.body;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      
      // Update sort order for each review
      const updatePromises = reviewOrder.map((item: { id: string, sortOrder: number }) =>
        PropertyReview.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id, propertyId: property.id } }
        )
      );
      
      await Promise.all(updatePromises);
      
      res.json({ 
        success: true, 
        message: 'Reviews reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering reviews:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to reorder reviews' 
      });
    }
  }

  // Upload customer photo for review (Admin)
  async uploadReviewCustomerPhoto(req: AuthRequest, res: Response) {
    try {
      const { id, reviewId } = req.params;
      
      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }
      
      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      
      const review = await PropertyReview.findOne({
        where: { id: reviewId, propertyId: property.id }
      });
      
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      // Upload to Digital Ocean Spaces
      const uploadResult = await uploadFile(
        req.file,
        req.file.originalname,
        {
          folder: MediaFolder.IMAGES,
          projectId: property.id,
          fileName: `customer-photo-${review.id}-${Date.now()}`
        }
      );
      
      await review.update({
        customerPhotoUrl: uploadResult.url,
        customerPhotoPath: uploadResult.key
      });
      
      res.json({ 
        success: true, 
        message: 'Customer photo uploaded successfully',
        data: {
          photoUrl: uploadResult.url,
          photoPath: uploadResult.key
        }
      });
    } catch (error) {
      console.error('Error uploading customer photo:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload customer photo' 
      });
    }
  }

  // Public reviews endpoint (client API)
  async getPropertyReviewsBySlug(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      if (!req.client || !req.client.id) {
        return res.status(401).json({ success: false, message: 'Client authentication required' });
      }
      
      const clientId = req.client.id;
      const cacheKey = `property:${clientId}:${slug}:reviews`;
      
      // Check cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }
      
      // Find property first
      const property = await Property.findOne({
        where: { slug, clientId, isActive: true },
        attributes: ['id']
      });
      
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      
      // Get active reviews
      const reviews = await PropertyReview.findAll({
        where: { 
          propertyId: property.id,
          isActive: true
        },
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        attributes: [
          'id', 'customerName', 'designation', 'reviewText', 'rating',
          'customerPhotoUrl', 'customerPhotoAlt', 'isFeatured'
        ]
      });
      
      // Cache for 5 minutes
      await CacheService.set(cacheKey, { reviews }, 300);
      
      res.json({ 
        success: true, 
        data: { reviews }
      });
    } catch (error) {
      console.error('Error fetching property reviews:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch property reviews' 
      });
    }
  }

  // Public API method for work-in-progress images
  async getPropertyWorkInProgressBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      // Find property by slug
      const property = await Property.findOne({
        where: { slug, isActive: true }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Get all progress images for this property
      const images = await PropertyProgressImage.findAll({
        where: { 
          propertyId: property.id, 
          isActive: true 
        },
        order: [['year', 'ASC'], ['month', 'ASC'], ['sortOrder', 'ASC']],
        attributes: ['id', 'year', 'month', 'imageUrl', 'alt', 'title', 'description', 'sortOrder']
      });

      // Post-process results into nested year->month->images structure
      // Using Map to maintain insertion order (chronological)
      const progressMap = new Map<string, Map<string, any[]>>();
      
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      images.forEach((image: any) => {
        const year = image.year.toString();
        const monthName = monthNames[image.month - 1]; // Convert 1-12 to month name
        
        // Initialize year if not exists
        if (!progressMap.has(year)) {
          progressMap.set(year, new Map<string, any[]>());
        }
        
        const yearMap = progressMap.get(year)!;
        
        // Initialize month if not exists
        if (!yearMap.has(monthName)) {
          yearMap.set(monthName, []);
        }
        
        // Add image data
        yearMap.get(monthName)!.push({
          id: image.id,
          url: image.imageUrl,
          title: image.title || '',
          alt: image.alt || '',
          description: image.description || '',
          sortOrder: image.sortOrder
        });
      });

      // Convert Maps to plain objects while maintaining order
      const currentProgress: Record<string, Record<string, any[]>> = {};
      
      // Sort years chronologically
      const sortedYears = Array.from(progressMap.keys()).sort((a, b) => parseInt(a) - parseInt(b));
      
      sortedYears.forEach(year => {
        currentProgress[year] = {};
        const yearMap = progressMap.get(year)!;
        
        // Sort months chronologically (January to December)
        const sortedMonths = Array.from(yearMap.keys()).sort((a, b) => {
          return monthNames.indexOf(a) - monthNames.indexOf(b);
        });
        
        sortedMonths.forEach(month => {
          currentProgress[year][month] = yearMap.get(month)!;
        });
      });

      // Cache the response for 10 minutes
      const cacheKey = `property:${property.id}:work-in-progress`;
      await CacheService.set(cacheKey, { current_progress: currentProgress }, 600);

      res.json({
        success: true,
        data: {
          current_progress: currentProgress
        }
      });
    } catch (error) {
      console.error('Error fetching property work-in-progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch work-in-progress data'
      });
    }
  }

  // Progress Images methods
  async getPropertyProgressImages(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { year, month } = req.query;

      const where: any = { propertyId: id, isActive: true };
      
      if (year) where.year = Number(year);
      if (month) where.month = Number(month);

      const images = await PropertyProgressImage.findAll({
        where,
        order: [['year', 'DESC'], ['month', 'DESC'], ['sortOrder', 'ASC']],
        attributes: ['id', 'year', 'month', 'imageUrl', 'alt', 'title', 'description', 'sortOrder']
      });

      res.json({
        success: true,
        data: { images }
      });
    } catch (error) {
      console.error('Error fetching progress images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch progress images'
      });
    }
  }

  async uploadPropertyProgressImages(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { year, month } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided'
        });
      }

      // Verify property exists and user has access
      const property = await Property.findOne({
        where: { 
          id,
          ...(req.user?.clientId ? { clientId: req.user.clientId } : {})
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Get current highest sort order for this year/month
      const lastImage = await PropertyProgressImage.findOne({
        where: { propertyId: id, year: Number(year), month: Number(month) },
        order: [['sortOrder', 'DESC']]
      });

      let sortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

      const uploadedImages: any[] = [];

      // Upload files to Digital Ocean Spaces
      for (const file of files) {
        try {
          const uploadResult = await uploadFile(
            file,
            file.originalname,
            {
              folder: MediaFolder.PROJECTS,
              projectId: id,
              subFolder: `progress-images/${year}/${month.toString().padStart(2, '0')}`
            }
          );

          // Create database record
          const progressImage = await PropertyProgressImage.create({
            propertyId: id,
            year: Number(year),
            month: Number(month),
            imageUrl: uploadResult.url,
            alt: '',
            title: '',
            description: '',
            sortOrder: sortOrder++,
            isActive: true
          });

          uploadedImages.push({
            id: progressImage.id,
            url: progressImage.imageUrl,
            alt: progressImage.alt,
            title: progressImage.title,
            description: progressImage.description,
            year: progressImage.year,
            month: progressImage.month,
            sortOrder: progressImage.sortOrder
          });
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          // Continue with other files
        }
      }

      res.json({
        success: true,
        data: { images: uploadedImages },
        message: `Successfully uploaded ${uploadedImages.length} images`
      });
    } catch (error) {
      console.error('Error uploading progress images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload progress images'
      });
    }
  }

  async updatePropertyProgressImage(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;
      const { alt, title, description, sortOrder, isActive } = req.body;

      // Verify property access
      const property = await Property.findOne({
        where: { 
          id,
          ...(req.user?.clientId ? { clientId: req.user.clientId } : {})
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const image = await PropertyProgressImage.findOne({
        where: { id: imageId, propertyId: id }
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Progress image not found'
        });
      }

      // Update fields
      const updateData: any = {};
      if (alt !== undefined) updateData.alt = alt;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (isActive !== undefined) updateData.isActive = isActive;

      await image.update(updateData);

      res.json({
        success: true,
        data: { 
          image: {
            id: image.id,
            url: image.imageUrl,
            alt: image.alt,
            title: image.title,
            description: image.description,
            year: image.year,
            month: image.month,
            sortOrder: image.sortOrder,
            isActive: image.isActive
          }
        },
        message: 'Progress image updated successfully'
      });
    } catch (error) {
      console.error('Error updating progress image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update progress image'
      });
    }
  }

  async deletePropertyProgressImage(req: AuthRequest, res: Response) {
    try {
      const { id, imageId } = req.params;

      // Verify property access
      const property = await Property.findOne({
        where: { 
          id,
          ...(req.user?.clientId ? { clientId: req.user.clientId } : {})
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const image = await PropertyProgressImage.findOne({
        where: { id: imageId, propertyId: id }
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Progress image not found'
        });
      }

      await image.destroy();

      res.json({
        success: true,
        message: 'Progress image deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting progress image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete progress image'
      });
    }
  }

  async reorderPropertyProgressImages(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { imageOrder } = req.body;

      // Verify property access
      const property = await Property.findOne({
        where: { 
          id,
          ...(req.user?.clientId ? { clientId: req.user.clientId } : {})
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Update sort order for each image
      for (const item of imageOrder) {
        await PropertyProgressImage.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id, propertyId: id } }
        );
      }

      res.json({
        success: true,
        message: 'Progress images reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering progress images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder progress images'
      });
    }
  }

  // Property Recommendations methods
  async getPropertyRecommendations(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Verify property access
      const property = await Property.findOne({
        where: { 
          id,
          ...(req.user?.clientId ? { clientId: req.user.clientId } : {})
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const recommendations = await PropertyRecommendation.findAll({
        where: { propertyId: id, isActive: true },
        include: [
          {
            association: 'recommendedProperty',
            attributes: ['id', 'name', 'slug'],
            where: { isActive: true },
            required: true
          }
        ],
        order: [['sortOrder', 'ASC']],
        attributes: ['id', 'recommendedPropertyId', 'sortOrder']
      });

      res.json({
        success: true,
        data: { recommendations }
      });
    } catch (error) {
      console.error('Error fetching property recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch property recommendations'
      });
    }
  }

  async addPropertyRecommendation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { recommendedPropertyId, sortOrder } = req.body;

      // Verify property access
      const property = await Property.findOne({
        where: { 
          id,
          ...(req.user?.clientId ? { clientId: req.user.clientId } : {})
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Verify recommended property exists
      const recommendedProperty = await Property.findOne({
        where: { id: recommendedPropertyId, isActive: true }
      });

      if (!recommendedProperty) {
        return res.status(404).json({
          success: false,
          message: 'Recommended property not found'
        });
      }

      // Prevent self-recommendation
      if (id === recommendedPropertyId) {
        return res.status(400).json({
          success: false,
          message: 'Property cannot recommend itself'
        });
      }

      // Check if recommendation already exists
      const existingRecommendation = await PropertyRecommendation.findOne({
        where: { propertyId: id, recommendedPropertyId }
      });

      if (existingRecommendation) {
        return res.status(400).json({
          success: false,
          message: 'This property is already recommended'
        });
      }

      // Get current highest sort order if not provided
      let finalSortOrder = sortOrder;
      if (finalSortOrder === undefined) {
        const lastRecommendation = await PropertyRecommendation.findOne({
          where: { propertyId: id },
          order: [['sortOrder', 'DESC']]
        });
        finalSortOrder = lastRecommendation ? lastRecommendation.sortOrder + 1 : 0;
      }

      // Create recommendation
      const recommendation = await PropertyRecommendation.create({
        propertyId: id,
        recommendedPropertyId,
        sortOrder: finalSortOrder,
        isActive: true
      });

      // Fetch the created recommendation with property details
      const createdRecommendation = await PropertyRecommendation.findByPk(recommendation.id, {
        include: [
          {
            association: 'recommendedProperty',
            attributes: ['id', 'name', 'slug']
          }
        ],
        attributes: ['id', 'recommendedPropertyId', 'sortOrder']
      });

      res.json({
        success: true,
        data: { recommendation: createdRecommendation },
        message: 'Property recommendation added successfully'
      });
    } catch (error) {
      console.error('Error adding property recommendation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add property recommendation'
      });
    }
  }

  async removePropertyRecommendation(req: AuthRequest, res: Response) {
    try {
      const { id, recommendationId } = req.params;

      // Verify property access
      const property = await Property.findOne({
        where: { 
          id,
          ...(req.user?.clientId ? { clientId: req.user.clientId } : {})
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const recommendation = await PropertyRecommendation.findOne({
        where: { id: recommendationId, propertyId: id }
      });

      if (!recommendation) {
        return res.status(404).json({
          success: false,
          message: 'Property recommendation not found'
        });
      }

      await recommendation.destroy();

      res.json({
        success: true,
        message: 'Property recommendation removed successfully'
      });
    } catch (error) {
      console.error('Error removing property recommendation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove property recommendation'
      });
    }
  }

  async reorderPropertyRecommendations(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { recommendationOrder } = req.body;

      // Verify property access
      const property = await Property.findOne({
        where: { 
          id,
          ...(req.user?.clientId ? { clientId: req.user.clientId } : {})
        }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Update sort order for each recommendation
      for (const item of recommendationOrder) {
        await PropertyRecommendation.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id, propertyId: id } }
        );
      }

      res.json({
        success: true,
        message: 'Property recommendations reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering property recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder property recommendations'
      });
    }
  }

  // Public API method for property recommendations
  async getPropertyRecommendationsBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      // Find property by slug
      const property = await Property.findOne({
        where: { slug, isActive: true }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Get recommendations with property details
      const recommendations = await PropertyRecommendation.findAll({
        where: { propertyId: property.id, isActive: true },
        include: [
          {
            association: 'recommendedProperty',
            attributes: PropertyService.PUBLIC_ATTRIBUTES,
            include: PropertyService.INCLUDES_WITH_ALL_DROPDOWNS,
            where: { isActive: true },
            required: true
          }
        ],
        order: [['sortOrder', 'ASC']],
        attributes: ['id', 'sortOrder']
      });

      // Format response using PropertyService
      const formattedRecommendations = PropertyService.formatPropertiesForAPI(
        recommendations.map((rec: any) => rec.recommendedProperty),
        (property: any, index: number) => ({ sortOrder: recommendations[index].sortOrder })
      );

      // Cache the response for 10 minutes
      const cacheKey = `property:${property.id}:recommendations`;
      await CacheService.set(cacheKey, { recommendations: formattedRecommendations }, 600);

      res.json({
        success: true,
        data: {
          recommendations: formattedRecommendations
        }
      });
    } catch (error) {
      console.error('Error fetching property recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch property recommendations'
      });
    }
  }

  // Reorder properties
  async reorderProperties(req: AuthRequest, res: Response) {
    try {
      console.log('🔄 reorderProperties called with:', req.body);
      const { propertyOrder } = req.body;

      if (!Array.isArray(propertyOrder) || propertyOrder.length === 0) {
        console.log('❌ Invalid propertyOrder:', propertyOrder);
        return res.status(400).json({
          success: false,
          message: 'Property order array is required'
        });
      }

      const clientId = req.user?.clientId;
      console.log('👤 Client ID:', clientId);
      if (!clientId) {
        console.log('❌ No client ID found');
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Validate that all properties belong to the client
      const propertyIds = propertyOrder.map(item => item.id);
      console.log('🏠 Property IDs to reorder:', propertyIds);
      
      const properties = await Property.findAll({
        where: {
          id: propertyIds,
          clientId: clientId
        }
      });

      console.log('🔍 Found properties:', properties.length, 'Expected:', propertyIds.length);

      if (properties.length !== propertyIds.length) {
        console.log('❌ Properties validation failed');
        return res.status(400).json({
          success: false,
          message: 'Some properties do not exist or do not belong to your client'
        });
      }

      // Update sort order for each property
      const updatePromises = propertyOrder.map(item =>
        Property.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id, clientId: clientId } }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Properties reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering properties:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder properties'
      });
    }
  }

  // Reorder location highlights
  async reorderLocationHighlights(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { highlightOrder } = req.body;

      console.log('Reorder location highlights request received:', {
        propertyId: id,
        highlightOrder: highlightOrder,
        bodyKeys: Object.keys(req.body)
      });

      if (!Array.isArray(highlightOrder) || highlightOrder.length === 0) {
        console.log('Validation failed:', { 
          isArray: Array.isArray(highlightOrder), 
          length: highlightOrder?.length,
          highlightOrder 
        });
        return res.status(400).json({
          success: false,
          message: 'Highlight order array is required'
        });
      }

      // Validate that all highlights belong to the property
      const highlightIds = highlightOrder.map(item => item.id);
      const highlights = await PropertyLocationHighlight.findAll({
        where: {
          id: highlightIds,
          propertyId: id
        }
      });

      if (highlights.length !== highlightIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some highlights do not exist or do not belong to this property'
        });
      }

      // Update sort order for each highlight
      const updatePromises = highlightOrder.map(item =>
        PropertyLocationHighlight.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id, propertyId: id } }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Location highlights reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering location highlights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder location highlights'
      });
    }
  }

  // Custom Fields CRUD Methods
  async getPropertyCustomFields(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const customFields = await PropertyCustomField.findAll({
        where: { 
          propertyId: property.id,
          isActive: true 
        },
        include: [
          {
            model: DropdownValue,
            as: 'fieldKey',
            attributes: ['id', 'value', 'slug'],
            include: [
              {
                model: DropdownCategory,
                as: 'category',
                attributes: ['name'],
                where: { name: 'custom_fields' }
              }
            ]
          }
        ],
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      res.json({
        success: true,
        data: customFields
      });
    } catch (error) {
      console.error('Custom fields fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch custom fields'
      });
    }
  }

  async addPropertyCustomField(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { fieldKeyId, fieldValue } = req.body;

      if (!fieldKeyId || !fieldValue) {
        return res.status(400).json({
          success: false,
          message: 'Field key ID and value are required'
        });
      }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Check if field key is valid (from custom_fields dropdown)
      const fieldKey = await DropdownValue.findOne({
        where: { id: fieldKeyId },
        include: [
          {
            model: DropdownCategory,
            as: 'category',
            where: { name: 'custom_fields' }
          }
        ]
      });

      if (!fieldKey) {
        return res.status(400).json({
          success: false,
          message: 'Invalid field key'
        });
      }

      // Check for duplicate field (same property + field key)
      const existingField = await PropertyCustomField.findOne({
        where: {
          propertyId: property.id,
          fieldKeyId: fieldKeyId,
          isActive: true
        }
      });

      if (existingField) {
        return res.status(400).json({
          success: false,
          message: 'This custom field already exists for this property'
        });
      }

      // Get the next sort order
      const lastField = await PropertyCustomField.findOne({
        where: { propertyId: property.id, isActive: true },
        order: [['sort_order', 'DESC']]
      });
      const sortOrder = lastField ? lastField.sortOrder + 1 : 1;

      const customField = await PropertyCustomField.create({
        propertyId: property.id,
        fieldKeyId,
        fieldValue,
        sortOrder,
        isActive: true
      });

      // Fetch the created field with associations
      const createdField = await PropertyCustomField.findByPk(customField.id, {
        include: [
          {
            model: DropdownValue,
            as: 'fieldKey',
            attributes: ['id', 'value', 'slug']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Custom field added successfully',
        data: createdField
      });
    } catch (error) {
      console.error('Custom field creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add custom field'
      });
    }
  }

  async updatePropertyCustomField(req: AuthRequest, res: Response) {
    try {
      const { id, fieldId } = req.params;
      const { fieldValue } = req.body;

      if (!fieldValue) {
        return res.status(400).json({
          success: false,
          message: 'Field value is required'
        });
      }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const customField = await PropertyCustomField.findOne({
        where: { 
          id: fieldId, 
          propertyId: property.id,
          isActive: true 
        }
      });

      if (!customField) {
        return res.status(404).json({
          success: false,
          message: 'Custom field not found'
        });
      }

      await customField.update({ fieldValue });

      // Fetch updated field with associations
      const updatedField = await PropertyCustomField.findByPk(customField.id, {
        include: [
          {
            model: DropdownValue,
            as: 'fieldKey',
            attributes: ['id', 'value', 'slug']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Custom field updated successfully',
        data: updatedField
      });
    } catch (error) {
      console.error('Custom field update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update custom field'
      });
    }
  }

  async deletePropertyCustomField(req: AuthRequest, res: Response) {
    try {
      const { id, fieldId } = req.params;

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const customField = await PropertyCustomField.findOne({
        where: { 
          id: fieldId, 
          propertyId: property.id,
          isActive: true 
        }
      });

      if (!customField) {
        return res.status(404).json({
          success: false,
          message: 'Custom field not found'
        });
      }

      await customField.update({ isActive: false });

      res.json({
        success: true,
        message: 'Custom field deleted successfully'
      });
    } catch (error) {
      console.error('Custom field delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete custom field'
      });
    }
  }

  async updatePropertyCustomFieldsOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { fieldOrder } = req.body; // Array of { id, sortOrder }

      const where: any = { id };
      if (req.user?.clientId) {
        where.clientId = req.user.clientId;
      }

      const property = await Property.findOne({ where });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (!Array.isArray(fieldOrder)) {
        return res.status(400).json({
          success: false,
          message: 'fieldOrder must be an array'
        });
      }

      // Update sort order for each custom field
      const updatePromises = fieldOrder.map(({ id: fieldId, sortOrder }) =>
        PropertyCustomField.update(
          { sortOrder },
          { 
            where: { 
              id: fieldId, 
              propertyId: property.id,
              isActive: true 
            } 
          }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Custom field order updated successfully'
      });
    } catch (error) {
      console.error('Custom field order update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update custom field order'
      });
    }
  }

  // Public API method to get custom fields by property slug
  async getPropertyCustomFieldsBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const property = await Property.findOne({
        where: { slug, isActive: true },
        attributes: ['id', 'name', 'slug']
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const customFields = await PropertyCustomField.findAll({
        where: { 
          propertyId: property.id,
          isActive: true 
        },
        include: [
          {
            model: DropdownValue,
            as: 'fieldKey',
            attributes: ['id', 'value', 'slug']
          }
        ],
        order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
      });

      // Transform the data for public consumption
      const publicCustomFields = customFields.map(field => ({
        id: field.id,
        key: field.fieldKey?.value || 'Unknown',
        slug: field.fieldKey?.slug || '',
        value: field.fieldValue,
        sortOrder: field.sortOrder
      }));

      res.json({
        success: true,
        data: {
          property: {
            id: property.id,
            name: property.name,
            slug: property.slug
          },
          customFields: publicCustomFields
        }
      });
    } catch (error) {
      console.error('Custom fields fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch custom fields'
      });
    }
  }
}

// Helper function to transform flat array to hierarchical structure
function transformToHierarchical(items: any[]): any[] {
  // First, create a map of all items by ID for easy lookup
  const itemMap = new Map();
  items.forEach(item => {
    itemMap.set(item.id, { ...item.toJSON ? item.toJSON() : item, children: [] });
  });

  // Build the hierarchical structure
  const rootItems: any[] = [];
  
  itemMap.forEach((item) => {
    if (item.parentId && itemMap.has(item.parentId)) {
      // This is a child item, add it to its parent's children array
      const parent = itemMap.get(item.parentId);
      parent.children.push(item);
    } else if (item.level === 1) {
      // This is a root item (level 1)
      rootItems.push(item);
    }
  });

  // Sort children within each parent by sortOrder
  rootItems.forEach(root => {
    if (root.children && root.children.length > 0) {
      root.children.sort((a: any, b: any) => {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
    }
  });

  return rootItems;
}