import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../../middleware/auth';
import Client from '../../models/Client';
import User from '../../models/User';
import BlogPost from '../../models/BlogPost';
import BlogCategory from '../../models/BlogCategory';
import BlogTag from '../../models/BlogTag';
import BlogMedia from '../../models/BlogMedia';
import BlogSeo from '../../models/BlogSeo';
import BlogPostCategory from '../../models/BlogPostCategory';
import BlogPostTag from '../../models/BlogPostTag';

interface GetPostsByTagQuery {
  page?: string;
  limit?: string;
  status?: 'draft' | 'published' | 'archived' | 'all';
  search?: string;
  authorId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}

export class BlogPostsByTagController {
  /**
   * Get all blog posts belonging to a specific tag
   * Supports filtering, pagination, and search within the tag
   */
  async getPostsByTag(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const clientId = user.clientId;
      const { slug: tagSlug } = req.params;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      if (!tagSlug) {
        return res.status(400).json({
          success: false,
          message: 'Tag slug is required'
        });
      }

      // Validate client exists and is active
      const client = await Client.findOne({
        where: { 
          id: clientId,
          isActive: true 
        }
      });

      if (!client) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or inactive client'
        });
      }

      // Find the tag
      const tag = await BlogTag.findOne({
        where: {
          slug: tagSlug,
          clientId
        }
      });

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
      }

      // Extract and validate query parameters
      const {
        page = '1',
        limit = '10',
        status = 'published',
        search,
        authorId,
        sortBy = 'publishedAt',
        sortOrder = 'DESC',
        startDate,
        endDate
      }: GetPostsByTagQuery = req.query;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
      const offset = (pageNum - 1) * limitNum;

      // Get all post IDs that belong to this tag
      const tagPostAssociations = await BlogPostTag.findAll({
        where: { tagId: tag.id },
        attributes: ['postId']
      });

      const tagPostIds = tagPostAssociations
        .map(assoc => assoc.postId)
        .filter((id): id is number => id !== null && id !== undefined); // Type guard to remove undefined

      if (tagPostIds.length === 0) {
        // No posts in this tag
        return res.json({
          success: true,
          data: {
            tag: {
              id: tag.uuid,
              name: tag.name,
              slug: tag.slug
            },
            posts: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: 0,
              pages: 0,
              hasNextPage: false,
              hasPrevPage: false,
              nextPage: null,
              prevPage: null
            },
            filters: {
              status,
              search: search || null,
              authorId: authorId || null,
              startDate: startDate || null,
              endDate: endDate || null,
              sortBy,
              sortOrder
            }
          }
        });
      }

      // Build where conditions for posts
      const whereConditions: any = {
        clientId,
        id: { [Op.in]: tagPostIds } // Now guaranteed to be number[]
      };

      // Status filter
      if (status !== 'all') {
        whereConditions.status = status;
      }

      // Author filter
      if (authorId) {
        // User model uses string UUID, so search by UUID not internal ID
        const author = await User.findOne({
          where: { 
            id: authorId, // This should be the UUID string
            clientId 
          }
        });
        if (author) {
          // Get the internal numeric ID from the user for the blog post query
          const userInternalId = (author as any).dataValues?.id || author.id;
          whereConditions.authorId = userInternalId;
        } else {
          // Author not found, return empty results
          whereConditions.id = { [Op.in]: [] as number[] };
        }
      }

      // Search functionality
      if (search && search.trim()) {
        const searchTerm = search.trim();
        whereConditions[Op.or] = [
          { title: { [Op.like]: `%${searchTerm}%` } },
          { content: { [Op.like]: `%${searchTerm}%` } },
          { excerpt: { [Op.like]: `%${searchTerm}%` } }
        ];
      }

      // Date range filter
      if (startDate || endDate) {
        const dateFilter: any = {};
        if (startDate) {
          dateFilter[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          dateFilter[Op.lte] = endDateTime;
        }
        whereConditions.publishedAt = dateFilter;
      }

      // Validate sort parameters
      const allowedSortFields = ['createdAt', 'updatedAt', 'publishedAt', 'title'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'publishedAt';
      const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      // Get posts with basic data only (no complex includes)
      const { count, rows: posts } = await BlogPost.findAndCountAll({
        where: whereConditions,
        order: [[sortField, sortDirection]],
        limit: limitNum,
        offset,
        attributes: ['id', 'uuid', 'title', 'slug', 'excerpt', 'content', 'status', 'isIndexable', 'authorId', 'featuredImageId', 'publishedAt', 'createdAt', 'updatedAt']
      });

      if (posts.length === 0) {
        return res.json({
          success: true,
          data: {
            tag: {
              id: tag.uuid,
              name: tag.name,
              slug: tag.slug
            },
            posts: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: count,
              pages: Math.ceil(count / limitNum),
              hasNextPage: false,
              hasPrevPage: pageNum > 1,
              nextPage: null,
              prevPage: pageNum > 1 ? pageNum - 1 : null
            },
            filters: {
              status,
              search: search || null,
              authorId: authorId || null,
              startDate: startDate || null,
              endDate: endDate || null,
              sortBy: sortField,
              sortOrder: sortDirection
            }
          }
        });
      }

      // Get all related data in parallel
      const postIds = posts.map(post => post.id);
      
      // Get author IDs that are actually present (filter out null/undefined)
      const authorIds = posts
        .map(post => post.authorId)
        .filter((id): id is string => id !== null && id !== undefined);
      
      // Get featured image IDs that are actually present
      const featuredImageIds = posts
        .map(post => post.featuredImageId)
        .filter((id): id is number => id !== null && id !== undefined);

      const [authors, featuredImages, postCategories, postTags, seoData] = await Promise.all([
        // Get authors - User model might use different ID structure
        authorIds.length > 0 ? User.findAll({
          where: { 
            // Check if User model uses internal ID or different field
            [User.primaryKeyAttribute || 'id']: { [Op.in]: authorIds }
          },
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }) : Promise.resolve([]),

        // Get featured images
        featuredImageIds.length > 0 ? BlogMedia.findAll({
          where: { id: { [Op.in]: featuredImageIds } },
          attributes: ['id', 'uuid', 'fileName', 'spacesKey', 'link', 'altText', 'fileSize']
        }) : Promise.resolve([]),

        // Get post-category relationships
        BlogPostCategory.findAll({
          where: { postId: { [Op.in]: postIds } },
          attributes: ['postId', 'categoryId']
        }),

        // Get post-tag relationships
        BlogPostTag.findAll({
          where: { postId: { [Op.in]: postIds } },
          attributes: ['postId', 'tagId']
        }),

        // Get SEO data
        BlogSeo.findAll({
          where: {
            entityType: 'post',
            entityId: { [Op.in]: postIds }
          },
          attributes: ['entityId', 'metaTitle', 'metaDescription', 'canonicalUrl', 'focusKeyword']
        })
      ]);

      // Get categories and tags separately
      const categoryIds = postCategories
        .map(pc => pc.categoryId)
        .filter((id): id is number => id !== null && id !== undefined);
      const tagIds = postTags
        .map(pt => pt.tagId)
        .filter((id): id is number => id !== null && id !== undefined);

      const [categories, tags] = await Promise.all([
        categoryIds.length > 0 ? BlogCategory.findAll({
          where: { id: { [Op.in]: categoryIds } },
          attributes: ['id', 'uuid', 'name', 'slug']
        }) : Promise.resolve([]),

        tagIds.length > 0 ? BlogTag.findAll({
          where: { id: { [Op.in]: tagIds } },
          attributes: ['id', 'uuid', 'name', 'slug']
        }) : Promise.resolve([])
      ]);

      // Create lookup maps
      const authorMap = new Map(authors.map(author => [author.id, author]));
      const featuredImageMap = new Map(featuredImages.map(img => [img.id, img]));
      const seoMap = new Map(seoData.map(seo => [seo.entityId, seo]));
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
      const tagMap = new Map(tags.map(tag => [tag.id, tag]));

      // Create post-to-categories mapping
      const postCategoriesMap = new Map<number, any[]>();
      postCategories.forEach(postCategory => {
        const categoryData = categoryMap.get(postCategory.categoryId);
        if (categoryData) {
          if (!postCategoriesMap.has(postCategory.postId)) {
            postCategoriesMap.set(postCategory.postId, []);
          }
          postCategoriesMap.get(postCategory.postId)!.push({
            id: categoryData.uuid,
            name: categoryData.name,
            slug: categoryData.slug
          });
        }
      });

      // Create post-to-tags mapping
      const postTagsMap = new Map<number, any[]>();
      postTags.forEach(postTag => {
        const tagData = tagMap.get(postTag.tagId);
        if (tagData) {
          if (!postTagsMap.has(postTag.postId)) {
            postTagsMap.set(postTag.postId, []);
          }
          postTagsMap.get(postTag.postId)!.push({
            id: tagData.uuid,
            name: tagData.name,
            slug: tagData.slug
          });
        }
      });

      // Format response data
      const formattedPosts = posts.map(post => {
        const author = post.authorId ? authorMap.get(post.authorId) : null;
        const featuredImage = post.featuredImageId ? featuredImageMap.get(post.featuredImageId) : null;
        const seo = seoMap.get(post.id);
        
        return {
          id: post.uuid,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : ''),
          status: post.status,
          isIndexable: post.isIndexable,
          publishedAt: post.publishedAt,
          author: author ? {
            id: author.id,
            name: `${author.firstName} ${author.lastName}`,
            email: author.email,
            avatar: author.avatar
          } : null,
          featuredImage: featuredImage ? {
            id: featuredImage.uuid,
            spacesKey: featuredImage.spacesKey,
            link: featuredImage.link,
            altText: featuredImage.altText
          } : null,
          categories: postCategoriesMap.get(post.id) || [],
          tags: postTagsMap.get(post.id) || [],
          seo: seo ? {
            metaTitle: seo.metaTitle,
            metaDescription: seo.metaDescription,
            canonicalUrl: seo.canonicalUrl,
            focusKeyword: seo.focusKeyword
          } : null,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        };
      });

      // Calculate pagination info
      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      // Set cache headers for better performance
      res.set('Cache-Control', 'public, max-age=60');

      res.json({
        success: true,
        data: {
          tag: {
            id: tag.uuid,
            name: tag.name,
            slug: tag.slug
          },
          posts: formattedPosts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count,
            pages: totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? pageNum + 1 : null,
            prevPage: hasPrevPage ? pageNum - 1 : null
          },
          filters: {
            status,
            search: search || null,
            authorId: authorId || null,
            startDate: startDate || null,
            endDate: endDate || null,
            sortBy: sortField,
            sortOrder: sortDirection
          }
        }
      });

    } catch (error: any) {
      console.error('Error fetching blog posts by tag:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blog posts by tag',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Get tag details with post count
   * Useful for tag listing pages
   */
  async getTagWithPostCount(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const clientId = user.clientId;
      const { slug: tagSlug } = req.params;

      if (!clientId || !tagSlug) {
        return res.status(400).json({
          success: false,
          message: 'Client ID and tag slug are required'
        });
      }

      // Validate client
      const client = await Client.findOne({
        where: { 
          id: clientId,
          isActive: true 
        }
      });

      if (!client) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or inactive client'
        });
      }

      // Find tag
      const tag = await BlogTag.findOne({
        where: {
          slug: tagSlug,
          clientId
        }
      });

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
      }

      // Count posts in this tag (published only)
      const postCount = await BlogPostTag.count({
        include: [{
          model: BlogPost,
          where: {
            clientId,
            status: 'published'
          },
          required: true
        }],
        where: {
          tagId: tag.id
        }
      });

      res.json({
        success: true,
        data: {
          tag: {
            id: tag.uuid,
            name: tag.name,
            slug: tag.slug,
            postCount,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
          }
        }
      });

    } catch (error: any) {
      console.error('Error fetching tag with post count:', error);
      
     res.status(500).json({
        success: false,
        message: 'Failed to fetch category details',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}