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

export class BlogGetSinglePostController {
  /**
   * Get a single blog post by ID or slug with next navigation only
   */
  async getPostByIdOrSlug(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const clientId = user.clientId;
      const { idOrSlug } = req.params;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      if (!idOrSlug) {
        return res.status(400).json({
          success: false,
          message: 'Post ID or slug is required'
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

      // Determine if idOrSlug is UUID or slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      const whereCondition = {
        clientId,
        [isUUID ? 'uuid' : 'slug']: idOrSlug
      };

      // Get the main post
      const post = await BlogPost.findOne({
        where: whereCondition,
        attributes: ['id', 'uuid', 'title', 'slug', 'content', 'excerpt', 'status', 'isIndexable', 'authorId', 'featuredImageId', 'publishedAt', 'createdAt', 'updatedAt']
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      // Get posts to exclude from News category
      const newsCategory = await BlogCategory.findOne({
        where: { uuid: '278942db-b226-4c90-a0bc-79f2e35ead94', clientId }
      });

      let excludedPostIds: number[] = [];
      if (newsCategory) {
        // Get all post IDs that belong to the News category
        excludedPostIds = await BlogPostCategory.findAll({
          where: { categoryId: newsCategory.id },
          attributes: ['postId']
        }).then(results => results.map(r => r.postId));
      }

      // Get only next post based on publishedAt date (only for published posts, excluding News category)
      // For latest post (July 17), "next" should be the second newest post (July 9)
      const [nextPost, fallbackPost] = await Promise.all([
        // Next post (older than current) - excluding News category
        BlogPost.findOne({
          where: {
            clientId,
            status: 'published',
            publishedAt: {
              [Op.lt]: post.publishedAt || post.createdAt // Less than current post (older posts)
            },
            // Exclude posts from News category
            ...(excludedPostIds.length > 0 && {
              id: { [Op.notIn]: excludedPostIds }
            })
          },
          attributes: ['uuid', 'slug', 'title'],
          order: [['publishedAt', 'DESC']], // Newest first to get the immediate previous
          limit: 1
        }),

        // Latest post - fallback when no older posts, excluding News category
        BlogPost.findOne({
          where: {
            clientId,
            status: 'published',
            uuid: { [Op.ne]: post.uuid }, // Exclude current post
            // Exclude posts from News category
            ...(excludedPostIds.length > 0 && {
              id: { [Op.notIn]: excludedPostIds }
            })
          },
          attributes: ['uuid', 'slug', 'title'],
          order: [['publishedAt', 'DESC']], // Get newest post as fallback
          limit: 1
        })
      ]);

      // Implement circular navigation for next only
      const finalNextPost = nextPost || fallbackPost;

      // Get all related data in parallel
      const authorIds = post.authorId ? [post.authorId] : [];
      const featuredImageIds = post.featuredImageId ? [post.featuredImageId] : [];

      const [author, featuredImage, postCategories, postTags, seoData] = await Promise.all([
        // Get author
        authorIds.length > 0 ? User.findOne({
          where: { id: authorIds[0] },
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }) : Promise.resolve(null),

        // Get featured image
        featuredImageIds.length > 0 ? BlogMedia.findOne({
          where: { id: featuredImageIds[0] },
          attributes: ['id', 'uuid', 'fileName', 'spacesKey', 'link', 'altText', 'fileSize']
        }) : Promise.resolve(null),

        // Get post-category relationships
        BlogPostCategory.findAll({
          where: { postId: post.id },
          attributes: ['postId', 'categoryId']
        }),

        // Get post-tag relationships
        BlogPostTag.findAll({
          where: { postId: post.id },
          attributes: ['postId', 'tagId']
        }),

        // Get SEO data
        BlogSeo.findOne({
          where: {
            entityType: 'post',
            entityId: post.id
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
          attributes: ['id', 'uuid', 'name', 'slug', 'description']
        }) : Promise.resolve([]),

        tagIds.length > 0 ? BlogTag.findAll({
          where: { id: { [Op.in]: tagIds } },
          attributes: ['id', 'uuid', 'name', 'slug']
        }) : Promise.resolve([])
      ]);

      // Format the response
      const formattedPost: any = {
        id: post.uuid,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : ''),
        status: post.status,
        isIndexable: post.isIndexable,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        
        // Featured image
        featuredImage: featuredImage ? {
          id: featuredImage.uuid,
          fileName: featuredImage.fileName,
          spacesKey: featuredImage.spacesKey,
          url: featuredImage.link,
          altText: featuredImage.altText,
          fileSize: featuredImage.fileSize
        } : null,

        // Categories
        categories: categories.map(category => ({
          id: category.uuid,
          name: category.name,
          slug: category.slug,
          description: category.description
        })),

        // Tags
        tags: tags.map(tag => ({
          id: tag.uuid,
          name: tag.name,
          slug: tag.slug
        })),

        // Navigation - only next post, no previous
        nextSlug: finalNextPost?.slug || null,
        nextId: finalNextPost?.uuid || null,
        nextTitle: finalNextPost?.title || null
      };

      // Add author if exists
      if (author) {
        formattedPost.author = {
          id: author.id,
          name: `${author.firstName} ${author.lastName}`,
          email: author.email,
          avatar: author.avatar
        };
      } else {
        formattedPost.author = null;
      }

      // Add SEO if exists
      if (seoData) {
        formattedPost.seo = {
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
          canonicalUrl: seoData.canonicalUrl,
          focusKeyword: seoData.focusKeyword
        };
      } else {
        formattedPost.seo = null;
      }

      res.json({
        success: true,
        data: formattedPost
      });

    } catch (error: any) {
      console.error('Error fetching blog post:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}