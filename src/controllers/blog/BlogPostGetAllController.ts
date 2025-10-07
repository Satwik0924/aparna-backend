import { Request, Response } from 'express';
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

interface GetAllPostsQuery {
  page?: string;
  limit?: string;
  status?: 'draft' | 'published' | 'archived' | 'all';
  search?: string;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}

export class BlogGetPostController {
  /**
   * Get all blog posts with comprehensive filtering, pagination, and search
   */
  async getAllPosts(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const clientId = user.clientId;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
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

      // Extract and validate query parameters
      const {
        page = '1',
        limit = '10',
        status = 'published',
        search,
        authorId,
        categoryId,
        tagId,
        sortBy = 'publishedAt',
        sortOrder = 'DESC',
        startDate,
        endDate
      }: GetAllPostsQuery = req.query;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitValue = parseInt(limit, 10) || 10;

      // FIXED: Special case - if limit is 0 or -1, get all posts (no limit)
      // Otherwise, allow up to 1000 posts (increased from 100)
      const limitNum = (limitValue === 0 || limitValue === -1) ? undefined : Math.min(1000, Math.max(1, limitValue));
      const offset = limitNum ? (pageNum - 1) * limitNum : 0;

      // Build where conditions
      const whereConditions: any = {
        clientId
      };

      // Status filter
      if (status !== 'all') {
        whereConditions.status = status;
      }

      // Author filter
      if (authorId) {
        whereConditions.authorId = authorId;
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

      // Handle category filter - Add to main query for proper pagination
      if (categoryId) {
        const categoryEntity = await BlogCategory.findOne({
          where: { uuid: categoryId, clientId }
        });
        if (categoryEntity) {
          const categoryPostIds = await BlogPostCategory.findAll({
            where: { categoryId: categoryEntity.id },
            attributes: ['postId']
          }).then(results => results.map(r => r.postId));
          
          if (categoryPostIds.length > 0) {
            whereConditions.id = whereConditions.id 
              ? { [Op.and]: [whereConditions.id, { [Op.in]: categoryPostIds }] }
              : { [Op.in]: categoryPostIds };
          } else {
            // No posts for this category
            whereConditions.id = { [Op.in]: [] };
          }
        } else {
          // Category not found
          whereConditions.id = { [Op.in]: [] };
        }
      }

      // Handle tag filter - Add to main query for proper pagination
      if (tagId) {
        const tagEntity = await BlogTag.findOne({
          where: { uuid: tagId, clientId }
        });
        if (tagEntity) {
          const tagPostIds = await BlogPostTag.findAll({
            where: { tagId: tagEntity.id },
            attributes: ['postId']
          }).then(results => results.map(r => r.postId));
          
          if (tagPostIds.length > 0) {
            whereConditions.id = whereConditions.id 
              ? { [Op.and]: [whereConditions.id, { [Op.in]: tagPostIds }] }
              : { [Op.in]: tagPostIds };
          } else {
            // No posts for this tag
            whereConditions.id = { [Op.in]: [] };
          }
        } else {
          // Tag not found
          whereConditions.id = { [Op.in]: [] };
        }
      }

      // Validate sort parameters
      const allowedSortFields = ['createdAt', 'updatedAt', 'publishedAt', 'title'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'publishedAt';
      const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      // FIXED: Build query options with conditional limit
      const queryOptions: any = {
        where: whereConditions,
        order: [[sortField, sortDirection]],
        offset,
        attributes: ['id', 'uuid', 'title', 'slug', 'excerpt', 'content', 'status', 'isIndexable', 'authorId', 'featuredImageId', 'publishedAt', 'createdAt', 'updatedAt']
      };

      // Only add limit if it's defined (not getting all posts)
      if (limitNum !== undefined) {
        queryOptions.limit = limitNum;
      }

      // Get posts with basic data only
      const { count, rows: posts } = await BlogPost.findAndCountAll(queryOptions);

      if (posts.length === 0) {
        return res.json({
          success: true,
          data: {
            posts: [],
            pagination: {
              page: pageNum,
              limit: limitNum || count, // Show actual count if no limit
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
              categoryId: categoryId || null,
              tagId: tagId || null,
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
      const authorIds = posts.map(post => post.authorId).filter((id): id is string => id !== null && id !== undefined);
      const featuredImageIds = posts.map(post => post.featuredImageId).filter((id): id is number => id !== null && id !== undefined);

      const [authors, featuredImages, postCategories, postTags, seoData] = await Promise.all([
        // Get authors
        authorIds.length > 0 ? User.findAll({
          where: { id: { [Op.in]: authorIds } },
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
      const categoryIds = postCategories.map(pc => pc.categoryId);
      const tagIds = postTags.map(pt => pt.tagId);

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
        const category = categoryMap.get(postCategory.categoryId);
        if (category) {
          if (!postCategoriesMap.has(postCategory.postId)) {
            postCategoriesMap.set(postCategory.postId, []);
          }
          postCategoriesMap.get(postCategory.postId)!.push({
            id: category.uuid,
            name: category.name,
            slug: category.slug
          });
        }
      });

      // Create post-to-tags mapping
      const postTagsMap = new Map<number, any[]>();
      postTags.forEach(postTag => {
        const tag = tagMap.get(postTag.tagId);
        if (tag) {
          if (!postTagsMap.has(postTag.postId)) {
            postTagsMap.set(postTag.postId, []);
          }
          postTagsMap.get(postTag.postId)!.push({
            id: tag.uuid,
            name: tag.name,
            slug: tag.slug
          });
        }
      });

      // Format response data to match the expected format
      const formattedPosts = posts.map(post => {
        const author = authorMap.get(post.authorId!);
        const featuredImage = featuredImageMap.get(post.featuredImageId!);
        const seo = seoMap.get(post.id);
        
        const responsePost: any = {
          id: post.uuid,
          title: post.title,
          slug: post.slug,
          status: post.status,
          excerpt: post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : ''),
          publishedAt: post.publishedAt,
          featuredImage: featuredImage ? {
            id: featuredImage.uuid,
            spacesKey: featuredImage.spacesKey,
            link: featuredImage.link,
            altText: featuredImage.altText
          } : null,
          categories: postCategoriesMap.get(post.id) || [],
          tags: postTagsMap.get(post.id) || []
        };

        // Add author if exists
        if (author) {
          responsePost.author = {
            id: author.id,
            name: `${author.firstName} ${author.lastName}`,
            email: author.email,
            avatar: author.avatar
          };
        }

        // Add SEO if exists
        if (seo) {
          responsePost.seo = {
            metaTitle: seo.metaTitle,
            metaDescription: seo.metaDescription,
            canonicalUrl: seo.canonicalUrl,
            focusKeyword: seo.focusKeyword
          };
        }

        // Add isIndexable
        responsePost.isIndexable = post.isIndexable;

        // Add timestamps
        responsePost.createdAt = post.createdAt;
        responsePost.updatedAt = post.updatedAt;

        return responsePost;
      });

      // FIXED: Calculate pagination info (handle case when no limit is set)
      const totalPages = limitNum ? Math.ceil(count / limitNum) : 1;
      const hasNextPage = limitNum ? pageNum < totalPages : false;
      const hasPrevPage = pageNum > 1;

      // Set cache headers for better performance
      res.set('Cache-Control', 'public, max-age=60');

      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            page: pageNum,
            limit: limitNum || count, // Show actual count if no limit was applied
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
            categoryId: categoryId || null,
            tagId: tagId || null,
            startDate: startDate || null,
            endDate: endDate || null,
            sortBy: sortField,
            sortOrder: sortDirection
          }
        }
      });

    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blog posts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}