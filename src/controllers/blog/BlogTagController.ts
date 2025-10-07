import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import BlogTag from '../../models/BlogTag';
import BlogPostTag from '../../models/BlogPostTag';
import { AuthRequest } from '../../middleware/auth';
import { deleteBlogSeoForEntity } from '../../models/BlogAssociations';

export class BlogTagController {
  /**
   * Get all blog tags for a client with optional filtering and pagination
   */
  async getTags(req: AuthRequest, res: Response) {
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
          { name: { [Op.like]: `%${search}%` } }
        ];
      }

      // Validate sort field
      const allowedSortFields = ['name', 'slug', 'createdAt', 'updatedAt'];
      const sortField = allowedSortFields.includes(sort as string) ? sort as string : 'name';
      const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';

      const { count, rows } = await BlogTag.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [[sortField, sortOrder]]
      });

      res.json({
        success: true,
        data: {
          tags: rows.map(tag => ({
            id: tag.uuid,
            name: tag.name,
            slug: tag.slug,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
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
      console.error('Error fetching blog tags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blog tags',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get a single blog tag by ID
   */
  async getTagById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!user.clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      const tag = await BlogTag.findOne({
        where: {
          uuid: id,
          clientId: user.clientId
        }
      });

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: 'Blog tag not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: tag.uuid,
          name: tag.name,
          slug: tag.slug,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Error fetching blog tag:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blog tag',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create a new blog tag
   */
  async createTag(req: AuthRequest, res: Response) {
    try {
      const { name, slug } = req.body;
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
          message: 'Tag name is required'
        });
      }

      if (name.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Tag name must be less than 255 characters'
        });
      }

      // Generate slug if not provided
      let tagSlug = slug;
      if (!tagSlug) {
        tagSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      } else {
        // Validate provided slug
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tagSlug)) {
          return res.status(400).json({
            success: false,
            message: 'Slug must contain only lowercase letters, numbers, and hyphens'
          });
        }
      }

      // Check if slug already exists for this client
      const existingTag = await BlogTag.findOne({
        where: {
          clientId: user.clientId,
          slug: tagSlug
        }
      });

      if (existingTag) {
        // Append a timestamp to make the slug unique
        const timestamp = Date.now().toString().slice(-6);
        tagSlug = `${tagSlug}-${timestamp}`;
      }

      // Create the tag
      const tag = await BlogTag.create({
        uuid: uuidv4(),
        clientId: user.clientId,
        name: name.trim(),
        slug: tagSlug
      });

      res.status(201).json({
        success: true,
        message: 'Blog tag created successfully',
        data: {
          id: tag.uuid,
          name: tag.name,
          slug: tag.slug,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Error creating blog tag:', error);
      
      // Handle unique constraint violations
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'A tag with this slug already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create blog tag',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update an existing blog tag
   */
  async updateTag(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, slug } = req.body;
      const user = req.user!;

      if (!user.clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Find the tag
      const tag = await BlogTag.findOne({
        where: {
          uuid: id,
          clientId: user.clientId
        }
      });

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: 'Blog tag not found'
        });
      }

      // Validation
      if (name !== undefined) {
        if (!name || name.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Tag name is required'
          });
        }

        if (name.length > 255) {
          return res.status(400).json({
            success: false,
            message: 'Tag name must be less than 255 characters'
          });
        }
      }

      // Handle slug update
      let tagSlug = tag.slug;
      if (slug !== undefined && slug !== tag.slug) {
        if (slug) {
          // Validate provided slug
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return res.status(400).json({
              success: false,
              message: 'Slug must contain only lowercase letters, numbers, and hyphens'
            });
          }

          // Check if slug already exists for this client
          const existingTag = await BlogTag.findOne({
            where: {
              clientId: user.clientId,
              slug: slug,
              uuid: { [Op.ne]: id } // Exclude current tag
            }
          });

          if (existingTag) {
            return res.status(400).json({
              success: false,
              message: 'A tag with this slug already exists'
            });
          }

          tagSlug = slug;
        } else {
          // Generate new slug from name if slug is empty
          const newName = name || tag.name;
          tagSlug = newName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // Check if generated slug already exists
          const existingTag = await BlogTag.findOne({
            where: {
              clientId: user.clientId,
              slug: tagSlug,
              uuid: { [Op.ne]: id }
            }
          });

          if (existingTag) {
            const timestamp = Date.now().toString().slice(-6);
            tagSlug = `${tagSlug}-${timestamp}`;
          }
        }
      }

      // Update the tag
      await tag.update({
        name: name !== undefined ? name.trim() : tag.name,
        slug: tagSlug
      });

      res.json({
        success: true,
        message: 'Blog tag updated successfully',
        data: {
          id: tag.uuid,
          name: tag.name,
          slug: tag.slug,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Error updating blog tag:', error);
      
      // Handle unique constraint violations
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'A tag with this slug already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update blog tag',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete a blog tag
   */
  async deleteTag(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!user.clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Find the tag
      const tag = await BlogTag.findOne({
        where: {
          uuid: id,
          clientId: user.clientId
        }
      });

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: 'Blog tag not found'
        });
      }

      // Check if tag is used in any posts
      const postCount = await BlogPostTag.count({
        where: {
          tagId: tag.id
        }
      });

      if (postCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete tag "${tag.name}" because it is currently linked to ${postCount} blog post${postCount > 1 ? 's' : ''}. Please remove this tag from all posts before deleting.`,
          postCount,
          tagName: tag.name
        });
      }

      // Delete associated SEO data
      if (user.clientId) {
        await deleteBlogSeoForEntity(user.clientId, 'tag', tag.id);
      }

      // Delete the tag
      await tag.destroy();

      res.json({
        success: true,
        message: 'Blog tag deleted successfully',
        data: { id }
      });
    } catch (error: any) {
      console.error('Error deleting blog tag:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete blog tag',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Bulk delete blog tags
   */
  async bulkDeleteTags(req: AuthRequest, res: Response) {
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
          message: 'Tag IDs array is required'
        });
      }

      // Find all tags
      const tags = await BlogTag.findAll({
        where: {
          uuid: { [Op.in]: ids },
          clientId: user.clientId
        }
      });

      if (tags.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No tags found'
        });
      }

      // Check if any tag is used in posts
      const results = await Promise.all(
        tags.map(async (tag) => {
          const postCount = await BlogPostTag.count({
            where: {
              tagId: tag.id
            }
          });
          return {
            id: tag.uuid,
            name: tag.name,
            canDelete: postCount === 0,
            postCount
          };
        })
      );

      const cannotDelete = results.filter(r => !r.canDelete);
      if (cannotDelete.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some tags cannot be deleted because they are linked to blog posts',
          details: 'Tags must be removed from all posts before they can be deleted',
          tags: cannotDelete.map(tag => ({
            id: tag.id,
            name: tag.name,
            postCount: tag.postCount,
            message: `"${tag.name}" is linked to ${tag.postCount} post${tag.postCount > 1 ? 's' : ''}`
          }))
        });
      }

      // Delete SEO data for all tags
      if (user.clientId) {
        await Promise.all(
          tags.map(tag => 
            deleteBlogSeoForEntity(user.clientId!, 'tag', tag.id)
          )
        );
      }

      // Delete all tags
      const deletedCount = await BlogTag.destroy({
        where: {
          uuid: { [Op.in]: ids },
          clientId: user.clientId
        }
      });

      res.json({
        success: true,
        message: `${deletedCount} blog tags deleted successfully`,
        data: { deletedCount, deletedIds: ids }
      });
    } catch (error: any) {
      console.error('Error bulk deleting blog tags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete blog tags',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}