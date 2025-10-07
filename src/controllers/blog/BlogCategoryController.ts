import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import BlogCategory from '../../models/BlogCategory';
import BlogPostCategory from '../../models/BlogPostCategory';
import { AuthRequest } from '../../middleware/auth';
import { deleteBlogSeoForEntity } from '../../models/BlogAssociations';

export class BlogCategoryController {
  /**
   * Get all blog categories for a client with optional filtering and pagination
   */
  async getCategories(req: AuthRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sort = 'name',
        order = 'ASC'
      } = req.query;

      const user = req.user!;
      
      if (!user.clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = { clientId: user.clientId };

      // Add search functionality
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      // Validate sort field
      const allowedSortFields = ['name', 'slug', 'createdAt', 'updatedAt'];
      const sortField = allowedSortFields.includes(sort as string) ? sort as string : 'name';
      const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';

      const { count, rows } = await BlogCategory.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [[sortField, sortOrder]]
      });

      res.json({
        success: true,
        data: {
          categories: rows.map(category => ({
            id: category.uuid,
            name: category.name,
            slug: category.slug,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error fetching blog categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blog categories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get a single blog category by ID
   */
  async getCategoryById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!user.clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      const category = await BlogCategory.findOne({
        where: {
          uuid: id,
          clientId: user.clientId
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Blog category not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: category.uuid,
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Error fetching blog category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blog category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create a new blog category
   */
  async createCategory(req: AuthRequest, res: Response) {
    try {
      const { name, slug, description } = req.body;
      const user = req.user!;

      if (!user.clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Validation
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      if (name.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Category name must be less than 255 characters'
        });
      }

      // Generate slug if not provided
      let categorySlug = slug;
      if (!categorySlug) {
        categorySlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      } else {
        // Validate provided slug
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(categorySlug)) {
          return res.status(400).json({
            success: false,
            message: 'Slug must contain only lowercase letters, numbers, and hyphens'
          });
        }
      }

      // Check if slug already exists for this client
      const existingCategory = await BlogCategory.findOne({
        where: {
          clientId: user.clientId,
          slug: categorySlug
        }
      });

      if (existingCategory) {
        // Append a timestamp to make the slug unique
        const timestamp = Date.now().toString().slice(-6);
        categorySlug = `${categorySlug}-${timestamp}`;
      }

      // Create the category
      const category = await BlogCategory.create({
        uuid: uuidv4(),
        clientId: user.clientId,
        name: name.trim(),
        slug: categorySlug,
        description: description?.trim() || ''
      });

      res.status(201).json({
        success: true,
        message: 'Blog category created successfully',
        data: {
          id: category.uuid,
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Error creating blog category:', error);
      
      // Handle unique constraint violations
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'A category with this slug already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create blog category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update an existing blog category
   */
  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, slug, description } = req.body;
      const user = req.user!;

      if (!user.clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Find the category
      const category = await BlogCategory.findOne({
        where: {
          uuid: id,
          clientId: user.clientId
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Blog category not found'
        });
      }

      // Validation
      if (name !== undefined) {
        if (!name || name.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Category name is required'
          });
        }

        if (name.length > 255) {
          return res.status(400).json({
            success: false,
            message: 'Category name must be less than 255 characters'
          });
        }
      }

      // Handle slug update
      let categorySlug = category.slug;
      if (slug !== undefined && slug !== category.slug) {
        if (slug) {
          // Validate provided slug
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return res.status(400).json({
              success: false,
              message: 'Slug must contain only lowercase letters, numbers, and hyphens'
            });
          }

          // Check if slug already exists for this client
          const existingCategory = await BlogCategory.findOne({
            where: {
              clientId: user.clientId,
              slug: slug,
              uuid: { [Op.ne]: id } // Exclude current category
            }
          });

          if (existingCategory) {
            return res.status(400).json({
              success: false,
              message: 'A category with this slug already exists'
            });
          }

          categorySlug = slug;
        } else {
          // Generate new slug from name if slug is empty
          const newName = name || category.name;
          categorySlug = newName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Check if generated slug already exists
          const existingCategory = await BlogCategory.findOne({
            where: {
              clientId: user.clientId,
              slug: categorySlug,
              uuid: { [Op.ne]: id }
            }
          });

          if (existingCategory) {
            const timestamp = Date.now().toString().slice(-6);
            categorySlug = `${categorySlug}-${timestamp}`;
          }
        }
      }

      // Update the category
      await category.update({
        name: name !== undefined ? name.trim() : category.name,
        slug: categorySlug,
        description: description !== undefined ? (description?.trim() || '') : category.description
      });

      res.json({
        success: true,
        message: 'Blog category updated successfully',
        data: {
          id: category.uuid,
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Error updating blog category:', error);
      
      // Handle unique constraint violations
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'A category with this slug already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update blog category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete a blog category
   */
  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!user.clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Find the category
      const category = await BlogCategory.findOne({
        where: {
          uuid: id,
          clientId: user.clientId
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Blog category not found'
        });
      }

      // Check if category is used in any posts
      const postCount = await BlogPostCategory.count({
        where: {
          categoryId: category.id
        }
      });

      if (postCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category "${category.name}" because it is currently linked to ${postCount} blog post${postCount > 1 ? 's' : ''}. Please remove this category from all posts before deleting.`,
          postCount,
          categoryName: category.name
        });
      }

      // Delete associated SEO data
      if (user.clientId) {
        await deleteBlogSeoForEntity(user.clientId, 'category', category.id);
      }

      // Delete the category
      await category.destroy();

      res.json({
        success: true,
        message: 'Blog category deleted successfully',
        data: { id }
      });
    } catch (error: any) {
      console.error('Error deleting blog category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete blog category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Bulk delete blog categories
   */
  async bulkDeleteCategories(req: AuthRequest, res: Response) {
    try {
      const { ids } = req.body;
      const user = req.user!;

      if (!user.clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category IDs array is required'
        });
      }

      // Find all categories
      const categories = await BlogCategory.findAll({
        where: {
          uuid: { [Op.in]: ids },
          clientId: user.clientId
        }
      });

      if (categories.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No categories found'
        });
      }

      // Check if any category is used in posts
      const results = await Promise.all(
        categories.map(async (category) => {
          const postCount = await BlogPostCategory.count({
            where: {
              categoryId: category.id
            }
          });
          return {
            id: category.uuid,
            name: category.name,
            canDelete: postCount === 0,
            postCount
          };
        })
      );

      const cannotDelete = results.filter(r => !r.canDelete);
      if (cannotDelete.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some categories cannot be deleted because they are linked to blog posts',
          details: 'Categories must be removed from all posts before they can be deleted',
          categories: cannotDelete.map(cat => ({
            id: cat.id,
            name: cat.name,
            postCount: cat.postCount,
            message: `"${cat.name}" is linked to ${cat.postCount} post${cat.postCount > 1 ? 's' : ''}`
          }))
        });
      }

      // Delete SEO data for all categories
      if (user.clientId) {
        await Promise.all(
          categories.map(category => 
            deleteBlogSeoForEntity(user.clientId!, 'category', category.id)
          )
        );
      }

      // Delete all categories
      const deletedCount = await BlogCategory.destroy({
        where: {
          uuid: { [Op.in]: ids },
          clientId: user.clientId
        }
      });

      res.json({
        success: true,
        message: `${deletedCount} blog categories deleted successfully`,
        data: { deletedCount, deletedIds: ids }
      });
    } catch (error: any) {
      console.error('Error bulk deleting blog categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete blog categories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}