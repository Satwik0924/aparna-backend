import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize, DropdownCategory, DropdownValue, Client } from '../models';
import { AuthRequest } from '../middleware/auth';

export class DropdownController {
  // Get all dropdown categories with hierarchical structure
  async getCategories(req: AuthRequest, res: Response) {
    try {
      const { search, isActive, level, parentId, includeHierarchy = 'false' } = req.query;
      
      const whereConditions: any = {};
      
      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      if (isActive !== undefined) {
        whereConditions.isActive = isActive === 'true';
      }
      

      if (level !== undefined) {
        whereConditions.level = parseInt(level as string);
      }

      if (parentId !== undefined) {
        whereConditions.parentId = parentId || null;
      }
      
      const include = [];
      
      // Include hierarchy if requested
      if (includeHierarchy === 'true') {
        include.push(
          {
            model: DropdownCategory,
            as: 'parent',
            attributes: ['id', 'name', 'level']
          },
          {
            model: DropdownCategory,
            as: 'children',
            attributes: ['id', 'name', 'level', 'sortOrder']
          }
        );
      }

      // Build order array
      const orderArray: any[] = [
        ['level', 'ASC'], 
        ['sortOrder', 'ASC'], 
        ['name', 'ASC']
      ];
      
      // Add association ordering only if hierarchy is included
      if (includeHierarchy === 'true') {
        orderArray.push(
          [{ model: DropdownCategory, as: 'children' }, 'sortOrder', 'ASC'],
          [{ model: DropdownCategory, as: 'children' }, 'name', 'ASC']
        );
      }

      const categories = await DropdownCategory.findAll({
        where: whereConditions,
        include,
        order: orderArray,
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM dropdown_values
                WHERE dropdown_values.category_id = DropdownCategory.id
                AND dropdown_values.deleted_at IS NULL
              )`),
              'valuesCount'
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM dropdown_categories AS children
                WHERE children.parent_id = DropdownCategory.id
                AND children.deleted_at IS NULL
              )`),
              'childrenCount'
            ]
          ]
        }
      });
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dropdown categories',
        error: error.message
      });
    }
  }

  // Get hierarchical tree structure of categories
  async getCategoriesTree(req: AuthRequest, res: Response) {
    try {
      const { isActive } = req.query;
      
      const whereConditions: any = { level: 0 }; // Only primary categories
      
      if (isActive !== undefined) {
        whereConditions.isActive = isActive === 'true';
      }

      const primaryCategories = await DropdownCategory.findAll({
        where: whereConditions,
        include: [
          {
            model: DropdownCategory,
            as: 'children',
            where: isActive !== undefined ? { isActive: isActive === 'true' } : {},
            required: false,
            attributes: ['id', 'name', 'level', 'sortOrder', 'isActive'],
            include: [
              {
                model: DropdownValue,
                as: 'values',
                where: isActive !== undefined ? { isActive: isActive === 'true' } : {},
                required: false,
                attributes: ['id', 'value', 'slug', 'color', 'icon', 'sortOrder']
              }
            ]
          },
          {
            model: DropdownValue,
            as: 'values',
            where: isActive !== undefined ? { isActive: isActive === 'true' } : {},
            required: false,
            attributes: ['id', 'value', 'slug', 'color', 'icon', 'sortOrder']
          }
        ],
        order: [
          ['sortOrder', 'ASC'], 
          ['name', 'ASC'],
          [{ model: DropdownCategory, as: 'children' }, 'sortOrder', 'ASC'],
          [{ model: DropdownCategory, as: 'children' }, 'name', 'ASC'],
          [{ model: DropdownValue, as: 'values' }, 'sortOrder', 'ASC'],
          [{ model: DropdownValue, as: 'values' }, 'value', 'ASC']
        ]
      });
      
      res.json({
        success: true,
        data: primaryCategories
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories tree',
        error: error.message
      });
    }
  }
  
  // Get single category
  async getCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const category = await DropdownCategory.findByPk(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      res.json({
        success: true,
        data: category
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category',
        error: error.message
      });
    }
  }
  
  // Create category
  async createCategory(req: AuthRequest, res: Response) {
    try {
      const { name, description, parentId, sortOrder = 0 } = req.body;
      
      // Validate parent category if provided
      let level = 0;
      if (parentId) {
        const parentCategory = await DropdownCategory.findByPk(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }
        
        if (parentCategory.level >= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot create sub-category under another sub-category. Maximum depth is 2 levels.'
          });
        }
        
        level = parentCategory.level + 1;
      }
      
      const category = await DropdownCategory.create({
        name,
        description,
        parentId: parentId || null,
        level,
        sortOrder,
        isActive: true
      });
      
      // Include parent information in response
      const categoryWithParent = await DropdownCategory.findByPk(category.id, {
        include: [
          {
            model: DropdownCategory,
            as: 'parent',
            attributes: ['id', 'name', 'level']
          }
        ]
      });
      
      res.status(201).json({
        success: true,
        data: categoryWithParent,
        message: 'Category created successfully'
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists under the same parent'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
  }
  
  // Update category
  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, parentId, sortOrder, isActive } = req.body;
      
      const category = await DropdownCategory.findByPk(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Validate parent category if being updated
      let level = category.level;
      if (parentId !== undefined) {
        if (parentId) {
          // Prevent circular references
          if (parentId === id) {
            return res.status(400).json({
              success: false,
              message: 'Category cannot be its own parent'
            });
          }

          const parentCategory = await DropdownCategory.findByPk(parentId);
          if (!parentCategory) {
            return res.status(400).json({
              success: false,
              message: 'Parent category not found'
            });
          }
          
          if (parentCategory.level >= 1) {
            return res.status(400).json({
              success: false,
              message: 'Cannot move category under a sub-category. Maximum depth is 2 levels.'
            });
          }

          // Check if this category has children - if so, prevent moving it under another category
          const childrenCount = await DropdownCategory.count({
            where: { parentId: id }
          });

          if (childrenCount > 0 && parentCategory.level >= 0) {
            return res.status(400).json({
              success: false,
              message: 'Cannot move category with children under another category. This would exceed maximum depth.'
            });
          }
          
          level = parentCategory.level + 1;
        } else {
          // Moving to root level
          level = 0;
        }
      }
      
      await category.update({
        name,
        description,
        parentId: parentId !== undefined ? (parentId || null) : category.parentId,
        level,
        sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
        isActive
      });

      // Include parent information in response
      const categoryWithParent = await DropdownCategory.findByPk(category.id, {
        include: [
          {
            model: DropdownCategory,
            as: 'parent',
            attributes: ['id', 'name', 'level']
          }
        ]
      });
      
      res.json({
        success: true,
        data: categoryWithParent,
        message: 'Category updated successfully'
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists under the same parent'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }
  }
  
  // Delete category
  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const category = await DropdownCategory.findByPk(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Check if category has values
      const valuesCount = await DropdownValue.count({
        where: { categoryId: id }
      });
      
      if (valuesCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with existing values. Delete all values first.'
        });
      }

      // Check if category has children
      const childrenCount = await DropdownCategory.count({
        where: { parentId: id }
      });
      
      if (childrenCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with sub-categories. Delete all sub-categories first.'
        });
      }
      
      await category.destroy();
      
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message
      });
    }
  }
  
  // Get values for a category
  async getCategoryValues(req: AuthRequest, res: Response) {
    try {
      const { categoryId } = req.params;
      const { clientId, search, isActive } = req.query;
      
      const whereConditions: any = { categoryId };
      
      if (clientId) {
        whereConditions[Op.or] = [
          { clientId: null },
          { clientId: clientId }
        ];
      } else {
        // If no clientId provided, check if user has a clientId
        const userClientId = req.user?.clientId;
        if (userClientId) {
          // Regular client user - show global + client-specific values
          whereConditions[Op.or] = [
            { clientId: null },
            { clientId: userClientId }
          ];
        } else {
          // Super admin or no client - show all values
          // This allows super admin to see all dropdown values
          whereConditions[Op.or] = [
            { clientId: null },
            { clientId: { [Op.ne]: null } }
          ];
        }
      }
      
      if (search) {
        whereConditions.value = { [Op.like]: `%${search}%` };
      }
      
      if (isActive !== undefined) {
        whereConditions.isActive = isActive === 'true';
      }
      
      const values = await DropdownValue.findAll({
        where: whereConditions,
        order: [['sortOrder', 'ASC'], ['value', 'ASC']],
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'companyName']
          }
        ]
      });
      
      res.json({
        success: true,
        data: values
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dropdown values',
        error: error.message
      });
    }
  }

  // Get values for a category by category name
  async getCategoryValuesByName(req: AuthRequest, res: Response) {
    try {
      console.log('🔍 getCategoryValuesByName called with params:', req.params);
      console.log('🔍 Query params:', req.query);
      console.log('🔍 User clientId from req.user:', req.user?.clientId);
      console.log('🔍 ClientId from query:', req.query.clientId);
      
      const { categoryName } = req.params;
      const { clientId, search, isActive } = req.query;
      
      console.log('🔍 Looking for category:', categoryName);
      
      // First find the category by name
      const category = await DropdownCategory.findOne({
        where: { name: categoryName }
      });
      
      console.log('🔍 Found category:', category ? category.toJSON() : 'null');
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      const whereConditions: any = { categoryId: category.id };
      
      // For city category, only return parent cities (not areas)
      if (categoryName === 'city') {
        whereConditions.parentId = null;
      }
      
      if (clientId) {
        whereConditions[Op.or] = [
          { clientId: null },
          { clientId: clientId }
        ];
      } else {
        // If no clientId provided, check if user has a clientId
        const userClientId = req.user?.clientId;
        if (userClientId) {
          // Regular client user - show global + client-specific values
          whereConditions[Op.or] = [
            { clientId: null },
            { clientId: userClientId }
          ];
        } else {
          // Super admin or no client - show all values
          // This allows super admin to see all dropdown values
          whereConditions[Op.or] = [
            { clientId: null },
            { clientId: { [Op.ne]: null } }
          ];
        }
      }
      
      if (search) {
        whereConditions.value = { [Op.like]: `%${search}%` };
      }
      
      if (isActive !== undefined) {
        whereConditions.isActive = isActive === 'true';
      }
      
      const values = await DropdownValue.findAll({
        where: whereConditions,
        order: [['sortOrder', 'ASC'], ['value', 'ASC']],
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'companyName']
          }
        ]
      });
      
      res.json({
        success: true,
        data: values
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dropdown values',
        error: error.message
      });
    }
  }

  // Get values by parent ID
  async getValuesByParent(req: AuthRequest, res: Response) {
    try {
      const { parentId } = req.params;
      const { isActive } = req.query;
      
      const whereConditions: any = { parentId };
      
      if (isActive !== undefined) {
        whereConditions.isActive = isActive === 'true';
      }
      
      const values = await DropdownValue.findAll({
        where: whereConditions,
        order: [['sortOrder', 'ASC'], ['value', 'ASC']]
      });
      
      res.json({
        success: true,
        data: values
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch values by parent',
        error: error.message
      });
    }
  }
  
  // Create dropdown value
  async createValue(req: AuthRequest, res: Response) {
    try {
      const { categoryId } = req.params;
      const { value, color, icon, sortOrder, clientId, parentId } = req.body;
      
      // Check if category exists
      const category = await DropdownCategory.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      
      const dropdownValue = await DropdownValue.create({
        categoryId,
        clientId,
        parentId,
        value,
        color,
        icon,
        sortOrder: sortOrder || 0,
        isActive: true
      });
      
      res.status(201).json({
        success: true,
        data: dropdownValue,
        message: 'Value created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create value',
        error: error.message
      });
    }
  }
  
  // Update dropdown value
  async updateValue(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { value, color, icon, sortOrder, isActive, parentId } = req.body;
      
      const dropdownValue = await DropdownValue.findByPk(id);
      
      if (!dropdownValue) {
        return res.status(404).json({
          success: false,
          message: 'Value not found'
        });
      }
      
      await dropdownValue.update({
        value,
        color,
        icon,
        sortOrder,
        isActive,
        parentId
      });
      
      res.json({
        success: true,
        data: dropdownValue,
        message: 'Value updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update value',
        error: error.message
      });
    }
  }
  
  // Delete dropdown value
  async deleteValue(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const dropdownValue = await DropdownValue.findByPk(id);
      
      if (!dropdownValue) {
        return res.status(404).json({
          success: false,
          message: 'Value not found'
        });
      }
      
      await dropdownValue.destroy();
      
      res.json({
        success: true,
        message: 'Value deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete value',
        error: error.message
      });
    }
  }
  
  // Reorder values
  async reorderValues(req: AuthRequest, res: Response) {
    try {
      const { values, valueIds } = req.body;
      
      let reorderData: { id: string; sortOrder: number }[];
      
      // Handle both formats: values array with id/sortOrder, or valueIds array
      if (values && Array.isArray(values)) {
        reorderData = values;
      } else if (valueIds && Array.isArray(valueIds)) {
        reorderData = valueIds.map((id: string, index: number) => ({
          id,
          sortOrder: index
        }));
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either values array or valueIds array is required'
        });
      }
      
      // Update all values in a transaction
      await sequelize.transaction(async (t) => {
        for (const item of reorderData) {
          await DropdownValue.update(
            { sortOrder: item.sortOrder },
            { 
              where: { id: item.id },
              transaction: t
            }
          );
        }
      });
      
      res.json({
        success: true,
        message: 'Values reordered successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to reorder values',
        error: error.message
      });
    }
  }
  
  // Get all values for a client (with overrides)
  async getClientValues(req: AuthRequest, res: Response) {
    try {
      const { clientId } = req.params;
      const { categoryId } = req.query;
      
      const whereConditions: any = {
        [Op.or]: [
          { clientId: null },
          { clientId: clientId }
        ]
      };
      
      if (categoryId) {
        whereConditions.categoryId = categoryId;
      }
      
      const values = await DropdownValue.findAll({
        where: whereConditions,
        include: [
          {
            model: DropdownCategory,
            as: 'category',
            attributes: ['id', 'name']
          }
        ],
        order: [['categoryId', 'ASC'], ['sortOrder', 'ASC'], ['value', 'ASC']]
      });
      
      // Group by category
      const groupedValues = values.reduce((acc: any, value: any) => {
        const categoryId = value.categoryId;
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category: value.category,
            values: []
          };
        }
        acc[categoryId].values.push(value);
        return acc;
      }, {});
      
      res.json({
        success: true,
        data: groupedValues
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch client values',
        error: error.message
      });
    }
  }

  // Public API to get dropdown categories (no authentication required)
  async getPublicDropdowns(req: Request, res: Response) {
    try {
      const { categories, type } = req.query;
      
      let categoryNames: string[] = [];
      
      if (categories) {
        if (typeof categories === 'string') {
          categoryNames = categories.split(',').map(cat => cat.trim());
        } else if (Array.isArray(categories)) {
          categoryNames = categories as string[];
        }
      } else if (type) {
        // Single category query param for backward compatibility
        categoryNames = [type as string];
      } else {
        // Default categories if none specified
        categoryNames = ['property_types', 'configurations', 'property_status', 'city', 'price_range'];
      }

      const whereConditions: any = {
        name: { [Op.in]: categoryNames },
        isActive: true
      };

      // Get categories with their values
      const categoriesData = await DropdownCategory.findAll({
        where: whereConditions,
        include: [
          {
            model: DropdownValue,
            as: 'values',
            where: { 
              isActive: true, 
              clientId: { [Op.eq]: null } as any,
              parentId: null // Only get parent values (cities, not areas)
            },
            required: false,
            attributes: ['id', 'value', 'slug', 'color', 'icon', 'sortOrder', 'parentId']
          }
        ],
        order: [
          ['sortOrder', 'ASC'],
          ['name', 'ASC'],
          [{ model: DropdownValue, as: 'values' }, 'sortOrder', 'ASC'],
          [{ model: DropdownValue, as: 'values' }, 'value', 'ASC']
        ]
      });

      // For city category, we need to fetch areas (child values) separately
      const cityCategory = categoriesData.find(cat => cat.name === 'city');
      let cityAreasMap: { [key: string]: any[] } = {};
      
      if (cityCategory && cityCategory.values) {
        // Get all city IDs
        const cityIds = cityCategory.values.map((city: any) => city.id);
        
        // Fetch all areas for these cities
        const areas = await DropdownValue.findAll({
          where: {
            parentId: { [Op.in]: cityIds },
            isActive: true,
            clientId: { [Op.eq]: null } as any
          },
          attributes: ['id', 'value', 'slug', 'color', 'icon', 'sortOrder', 'parentId'],
          order: [['value', 'ASC']] // Changed: Only order by value for alphabetical sorting
        });
        
        // Group areas by parent city
        areas.forEach((area: any) => {
          if (!cityAreasMap[area.parentId]) {
            cityAreasMap[area.parentId] = [];
          }
          cityAreasMap[area.parentId].push({
            id: area.id,
            value: area.value,
            slug: area.slug,
            color: area.color,
            icon: area.icon,
            sortOrder: area.sortOrder
          });
        });
      }

      // Transform data to include parent-child hierarchy
      const transformedData = categoriesData.map(category => {
        const categoryData: any = {
          id: category.id,
          name: category.name,
          description: category.description,
          level: category.level,
          sortOrder: category.sortOrder,
          values: []
        };

        // Special handling for city category
        if (category.name === 'city' && category.values) {
          categoryData.values = category.values.map((city: any) => ({
            id: city.id,
            value: city.value,
            slug: city.slug,
            color: city.color,
            icon: city.icon,
            sortOrder: city.sortOrder,
            areas: cityAreasMap[city.id] || []
          }));
        } else {
          categoryData.values = category.values || [];
        }

        return categoryData;
      });

      // Return single object if only one category requested, array otherwise
      if (categoryNames.length === 1 && transformedData.length === 1) {
        res.json({
          success: true,
          data: transformedData[0]
        });
      } else {
        // Return as object with category names as keys for easy access
        const result: any = {};
        transformedData.forEach(category => {
          result[category.name] = category;
        });
        
        res.json({
          success: true,
          data: result
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dropdown categories',
        error: error.message
      });
    }
  }
}