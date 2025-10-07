import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import ProjectCarousel from '../models/ProjectCarousel';
import ProjectCarouselItem from '../models/ProjectCarouselItem';
import Property from '../models/Property';
import DropdownValue from '../models/DropdownValue';
import { CacheService } from '../utils/cache';
import { PropertyService } from '../services/PropertyService';

export class ProjectCarouselController {
  // Get all carousels (admin)
  async getCarouselsAdmin(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10, search = '', isActive } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const clientId = req.user?.clientId;

      const whereClause: any = { clientId };

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const { count, rows: carousels } = await ProjectCarousel.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: 'items',
            attributes: ['id'],
            required: false
          }
        ],
        limit: Number(limit),
        offset,
        order: [['displayOrder', 'ASC']],
        distinct: true
      });

      // Add item count to each carousel
      const carouselsWithCount = carousels.map((carousel: any) => ({
        ...carousel.toJSON(),
        itemCount: carousel.items?.length || 0,
        items: undefined // Remove items array to reduce payload
      }));

      res.json({
        success: true,
        data: {
          carousels: carouselsWithCount,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching carousels:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch carousels'
      });
    }
  }

  // Get single carousel with items (admin)
  async getCarouselAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const clientId = req.user?.clientId;

      const carousel = await ProjectCarousel.findOne({
        where: { id, clientId },
        include: [
          {
            association: 'items',
            include: [
              {
                association: 'property',
                attributes: PropertyService.PUBLIC_ATTRIBUTES,
                include: PropertyService.STANDARD_INCLUDES
              }
            ],
            order: [['sortOrder', 'ASC']]
          },
          {
            association: 'city',
            attributes: ['id', 'value', 'slug']
          },
          {
            association: 'area',
            attributes: ['id', 'value', 'slug']
          }
        ]
      });

      if (!carousel) {
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }

      res.json({
        success: true,
        data: { carousel }
      });
    } catch (error) {
      console.error('Error fetching carousel:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch carousel'
      });
    }
  }

  // Create carousel
  async createCarousel(req: AuthRequest, res: Response) {
    try {
      const { name, description, cityId, areaId, isActive = true } = req.body;
      const clientId = req.user?.clientId;

      if (!clientId) {
        return res.status(401).json({
          success: false,
          message: 'Client ID not found'
        });
      }

      // Get the next display order
      const maxOrder = await ProjectCarousel.max('displayOrder', {
        where: { clientId }
      }) as number | null;
      const displayOrder = (maxOrder || 0) + 1;

      const carousel = await ProjectCarousel.create({
        clientId,
        name,
        description,
        cityId,
        areaId,
        displayOrder,
        isActive
      });

      res.status(201).json({
        success: true,
        data: { carousel },
        message: 'Carousel created successfully'
      });
    } catch (error) {
      console.error('Error creating carousel:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create carousel'
      });
    }
  }

  // Update carousel
  async updateCarousel(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, cityId, areaId, isActive } = req.body;
      const clientId = req.user?.clientId;

      const carousel = await ProjectCarousel.findOne({
        where: { id, clientId }
      });

      if (!carousel) {
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }

      await carousel.update({
        name,
        description,
        cityId,
        areaId,
        isActive
      });

      // Clear cache
      await CacheService.delPattern(`carousel:${id}:*`);

      res.json({
        success: true,
        data: { carousel },
        message: 'Carousel updated successfully'
      });
    } catch (error) {
      console.error('Error updating carousel:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update carousel'
      });
    }
  }

  // Delete carousel
  async deleteCarousel(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const clientId = req.user?.clientId;

      const carousel = await ProjectCarousel.findOne({
        where: { id, clientId }
      });

      if (!carousel) {
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }

      await carousel.destroy();

      // Clear cache
      await CacheService.delPattern(`carousel:${id}:*`);

      res.json({
        success: true,
        message: 'Carousel deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting carousel:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete carousel'
      });
    }
  }

  // Add property to carousel
  async addCarouselItem(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { propertyId, sortOrder } = req.body;
      const clientId = req.user?.clientId;

      // Verify carousel exists and belongs to client
      const carousel = await ProjectCarousel.findOne({
        where: { id, clientId }
      });

      if (!carousel) {
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }

      // Verify property exists and belongs to client
      const property = await Property.findOne({
        where: { id: propertyId, clientId }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Check if property already exists in carousel
      const existingItem = await ProjectCarouselItem.findOne({
        where: { carouselId: id, propertyId }
      });

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Property already exists in this carousel'
        });
      }

      // Get the next sort order if not provided
      let itemSortOrder = sortOrder;
      if (itemSortOrder === undefined) {
        const maxOrder = await ProjectCarouselItem.max('sortOrder', {
          where: { carouselId: id }
        }) as number | null;
        itemSortOrder = (maxOrder || 0) + 1;
      }

      const item = await ProjectCarouselItem.create({
        carouselId: id,
        propertyId,
        sortOrder: itemSortOrder
      });

      // Fetch the created item with property details
      const itemWithProperty = await ProjectCarouselItem.findByPk(item.id, {
        include: [
          {
            association: 'property',
            attributes: PropertyService.PUBLIC_ATTRIBUTES,
            include: PropertyService.STANDARD_INCLUDES
          }
        ]
      });

      // Clear cache
      await CacheService.delPattern(`carousel:${id}:*`);

      res.status(201).json({
        success: true,
        data: { item: itemWithProperty },
        message: 'Property added to carousel successfully'
      });
    } catch (error) {
      console.error('Error adding carousel item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add property to carousel'
      });
    }
  }

  // Remove property from carousel
  async removeCarouselItem(req: AuthRequest, res: Response) {
    try {
      const { id, itemId } = req.params;
      const clientId = req.user?.clientId;

      // Verify carousel exists and belongs to client
      const carousel = await ProjectCarousel.findOne({
        where: { id, clientId }
      });

      if (!carousel) {
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }

      const item = await ProjectCarouselItem.findOne({
        where: { id: itemId, carouselId: id }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in carousel'
        });
      }

      await item.destroy();

      // Clear cache
      await CacheService.delPattern(`carousel:${id}:*`);

      res.json({
        success: true,
        message: 'Property removed from carousel successfully'
      });
    } catch (error) {
      console.error('Error removing carousel item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove property from carousel'
      });
    }
  }

  // Reorder carousel items
  async reorderCarouselItems(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { itemOrder } = req.body;
      const clientId = req.user?.clientId;

      // Verify carousel exists and belongs to client
      const carousel = await ProjectCarousel.findOne({
        where: { id, clientId }
      });

      if (!carousel) {
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }

      // Update sort order for each item
      const updatePromises = itemOrder.map((item: { id: string; sortOrder: number }) =>
        ProjectCarouselItem.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id, carouselId: id } }
        )
      );

      await Promise.all(updatePromises);

      // Clear cache
      await CacheService.delPattern(`carousel:${id}:*`);

      res.json({
        success: true,
        message: 'Carousel items reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering carousel items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder carousel items'
      });
    }
  }

  // Get carousels (public API with optional city/area filters)
  async getCarouselsPublic(req: Request, res: Response) {
    try {
      const { cityId, areaId, limit = 10, page = 1 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Build where clause
      const whereClause: any = { isActive: true };
      
      // Add city filter if provided
      if (cityId) {
        whereClause.cityId = cityId;
      }
      
      // Add area filter if provided (area filter requires city filter)
      if (areaId && cityId) {
        whereClause.areaId = areaId;
      }

      // Check cache
      const cacheKey = `carousels:public:city_${cityId || 'all'}:area_${areaId || 'all'}:page_${page}:limit_${limit}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      // First get carousel IDs with pagination
      const { count, rows: carouselIds } = await ProjectCarousel.findAndCountAll({
        where: whereClause,
        attributes: ['id'],
        limit: Number(limit),
        offset,
        distinct: true,
        order: [['displayOrder', 'ASC']]
      });

      // If no carousels found, return empty results
      if (carouselIds.length === 0) {
        return res.json({
          success: true,
          data: {
            carousels: [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: 0,
              totalPages: 0
            }
          }
        });
      }

      // Then fetch full carousel data with associations
      const carousels = await ProjectCarousel.findAll({
        where: {
          id: carouselIds.map(c => c.id)
        },
        attributes: ['id', 'name', 'slug', 'description', 'cityId', 'areaId', 'displayOrder'],
        include: [
          {
            model: ProjectCarouselItem,
            as: 'items',
            where: { isActive: true },
            required: false,
            attributes: ['id', 'sortOrder', 'propertyId'],
            include: [
              {
                model: Property,
                as: 'property',
                where: { isActive: true },
                required: false,
                attributes: PropertyService.PUBLIC_ATTRIBUTES,
                include: PropertyService.INCLUDES_WITH_ALL_DROPDOWNS
              }
            ]
          },
          {
            association: 'city',
            attributes: ['id', 'value', 'slug'],
            required: false
          },
          {
            association: 'area',
            attributes: ['id', 'value', 'slug'],
            required: false
          }
        ],
        order: [
          ['displayOrder', 'ASC'],
          [{ model: ProjectCarouselItem, as: 'items' }, 'sortOrder', 'ASC']
        ]
      });

      // Format response and filter items if needed
      const formattedCarousels = carousels.map((carousel: any) => {
        let items = carousel.items || [];
        
        // Filter items based on query parameters if carousel doesn't have specific city/area
        if (!carousel.cityId && !carousel.areaId && (cityId || areaId)) {
          items = items.filter((item: any) => {
            if (!item.property) return false;
            
            // Check city match
            if (cityId && item.property.cityId !== cityId) return false;
            
            // Check area match
            if (areaId && item.property.areaId !== areaId) return false;
            
            return true;
          });
        }
        
        return {
          id: carousel.id,
          name: carousel.name,
          slug: carousel.slug,
          description: carousel.description,
          city: carousel.city,
          area: carousel.area,
          properties: PropertyService.formatPropertiesForAPI(
            items.map((item: any) => item.property).filter(Boolean),
            (property: any, index: number) => ({ sortOrder: items[index]?.sortOrder || 0 })
          )
        };
      });

      const responseData = {
        carousels: formattedCarousels,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / Number(limit))
        }
      };

      // Cache for 10 minutes
      await CacheService.set(cacheKey, responseData, 600);

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('Error fetching carousels:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch carousels'
      });
    }
  }

  // Get carousel by slug (public API with optional city/area filters)
  async getCarouselBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { cityId, areaId } = req.query;

      // Build where clause for carousel
      const carouselWhere: any = { slug, isActive: true };
      
      // Check cache
      const cacheKey = `carousel:${slug}:city_${cityId || 'all'}:area_${areaId || 'all'}:public`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const carousel: any = await ProjectCarousel.findOne({
        where: carouselWhere,
        attributes: ['id', 'name', 'slug', 'description', 'cityId', 'areaId'],
        include: [
          {
            association: 'items',
            where: { isActive: true },
            required: false,
            attributes: ['id', 'sortOrder'],
            include: [
              {
                association: 'property',
                where: { isActive: true },
                required: true,
                attributes: PropertyService.PUBLIC_ATTRIBUTES,
                include: PropertyService.INCLUDES_WITH_ALL_DROPDOWNS
              }
            ]
          },
          {
            association: 'city',
            attributes: ['id', 'value', 'slug'],
            required: false
          },
          {
            association: 'area',
            attributes: ['id', 'value', 'slug'],
            required: false
          }
        ],
        order: [
          [{ model: ProjectCarouselItem, as: 'items' }, 'sortOrder', 'ASC']
        ]
      });

      if (!carousel) {
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }

      // If carousel has specific city/area set, filter properties accordingly
      let filteredItems = carousel.items;
      if (carousel.cityId || carousel.areaId) {
        // Carousel has specific location set, return all its items
        filteredItems = carousel.items;
      } else if (cityId || areaId) {
        // Filter items based on property location
        filteredItems = carousel.items?.filter((item: any) => {
          const property = item.property;
          if (!property) return false;
          
          // Check city match
          if (cityId && property.cityId !== cityId) return false;
          
          // Check area match (only if city also matches)
          if (areaId && cityId && property.areaId !== areaId) return false;
          
          return true;
        });
      }

      // Format response
      const formattedCarousel = {
        id: carousel.id,
        name: carousel.name,
        slug: carousel.slug,
        description: carousel.description,
        city: carousel.city,
        area: carousel.area,
        properties: PropertyService.formatPropertiesForAPI(
          filteredItems?.map((item: any) => item.property) || [],
          (property: any, index: number) => ({ sortOrder: filteredItems?.[index]?.sortOrder || 0 })
        )
      };

      // Cache for 10 minutes
      await CacheService.set(cacheKey, { carousel: formattedCarousel }, 600);

      res.json({
        success: true,
        data: { carousel: formattedCarousel }
      });
    } catch (error) {
      console.error('Error fetching carousel by slug:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch carousel'
      });
    }
  }

  // Get carousel by ID (public API)
  async getCarouselById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check cache first
      const cacheKey = `carousel:${id}:public`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const carousel = await ProjectCarousel.findOne({
        where: { id, isActive: true },
        attributes: ['id', 'name', 'slug', 'description', 'cityId', 'areaId'],
        include: [
          {
            association: 'items',
            where: { isActive: true },
            required: false,
            attributes: ['id', 'sortOrder'],
            include: [
              {
                association: 'property',
                where: { isActive: true },
                required: true,
                attributes: PropertyService.PUBLIC_ATTRIBUTES,
                include: PropertyService.INCLUDES_WITH_ALL_DROPDOWNS
              }
            ]
          },
          {
            association: 'city',
            attributes: ['id', 'value', 'slug']
          },
          {
            association: 'area',
            attributes: ['id', 'value', 'slug']
          }
        ],
        order: [
          [{ model: ProjectCarouselItem, as: 'items' }, 'sortOrder', 'ASC']
        ]
      });

      if (!carousel) {
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }

      // Format response using PropertyService
      const formattedCarousel = {
        id: carousel.id,
        name: carousel.name,
        slug: carousel.slug,
        description: carousel.description,
        properties: PropertyService.formatPropertiesForAPI(
          carousel.items?.map((item: any) => item.property) || [],
          (property: any, index: number) => ({ sortOrder: carousel.items?.[index]?.sortOrder || 0 })
        )
      };

      // Cache the response for 10 minutes
      await CacheService.set(cacheKey, { carousel: formattedCarousel }, 600);

      res.json({
        success: true,
        data: { carousel: formattedCarousel }
      });
    } catch (error) {
      console.error('Error fetching carousel:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch carousel'
      });
    }
  }
}