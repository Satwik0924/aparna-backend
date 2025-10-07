import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../../middleware/auth';
import Client from '../../models/Client';
import User from '../../models/User';
import BlogPost from '../../models/BlogPost';
import BlogCategory from '../../models/BlogCategory';
import BlogMedia from '../../models/BlogMedia';
import BlogPostCategory from '../../models/BlogPostCategory';

export class BlogRecommendedPostsController {
  /**
   * Get recommended blog posts based on same categories as the current post
   */
  async getRecommendedPosts(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const clientId = user.clientId;
      const { postIdOrSlug } = req.params;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      const { limit = '5' } = req.query;
      const limitNum = Math.min(10, Math.max(1, parseInt(limit as string, 10) || 5));

      // Find the current post
      const whereCondition = postIdOrSlug.includes('-') 
        ? { slug: postIdOrSlug, clientId }
        : { uuid: postIdOrSlug, clientId };

      const currentPost = await BlogPost.findOne({
        where: whereCondition,
        attributes: ['id']
      });

      if (!currentPost) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Get categories of the current post
      const postCategories = await BlogPostCategory.findAll({
        where: { postId: currentPost.id },
        attributes: ['categoryId']
      });

      const categoryIds = postCategories.map(pc => pc.categoryId);

      if (categoryIds.length === 0) {
        return res.json({
          success: true,
          data: { recommendedPosts: [], total: 0 }
        });
      }

      // Find posts with same categories (excluding current post)
      const sameCategoryPosts = await BlogPostCategory.findAll({
        where: { 
          categoryId: { [Op.in]: categoryIds },
          postId: { [Op.ne]: currentPost.id }
        },
        attributes: ['postId'],
        include: [{
          model: BlogPost,
          as: 'post',
          where: { 
            clientId,
            status: 'published'
          },
          attributes: []
        }]
      });

      const recommendedPostIds = [...new Set(sameCategoryPosts.map(scp => scp.postId))];
      
      if (recommendedPostIds.length === 0) {
        return res.json({
          success: true,
          data: { recommendedPosts: [], total: 0 }
        });
      }

      // Get recommended posts with details
      const recommendedPosts = await BlogPost.findAll({
        where: { 
          id: { [Op.in]: recommendedPostIds.slice(0, limitNum) },
          clientId 
        },
        attributes: ['id', 'uuid', 'title', 'slug', 'excerpt', 'content', 'featuredImageId', 'authorId', 'publishedAt'],
        order: [['publishedAt', 'DESC']]
      });

      // Get authors and featured images (filter out undefined values)
      const authorIds = recommendedPosts.map(p => p.authorId).filter((id): id is string => id !== null && id !== undefined);
      const imageIds = recommendedPosts.map(p => p.featuredImageId).filter((id): id is number => id !== null && id !== undefined);

      const [authors, images, postCats, categories] = await Promise.all([
        authorIds.length > 0 ? User.findAll({
          where: { id: { [Op.in]: authorIds } },
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }) : Promise.resolve([]),
        
        imageIds.length > 0 ? BlogMedia.findAll({
          where: { id: { [Op.in]: imageIds } },
          attributes: ['id', 'uuid', 'link', 'altText']
        }) : Promise.resolve([]),

        BlogPostCategory.findAll({
          where: { postId: { [Op.in]: recommendedPosts.map(p => p.id) } },
          attributes: ['postId', 'categoryId']
        }),

        BlogCategory.findAll({
          where: { clientId },
          attributes: ['id', 'uuid', 'name', 'slug']
        })
      ]);

      // Create maps
      const authorMap = new Map(authors.map(a => [a.id, a]));
      const imageMap = new Map(images.map(i => [i.id, i]));
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const categoriesMap = new Map();
      
      postCats.forEach(pc => {
        const category = categoryMap.get(pc.categoryId);
        if (category) {
          if (!categoriesMap.has(pc.postId)) categoriesMap.set(pc.postId, []);
          categoriesMap.get(pc.postId).push({
            id: category.uuid,
            name: category.name,
            slug: category.slug
          });
        }
      });

      // Format response
      const formattedPosts = recommendedPosts.map(post => {
        const author = post.authorId ? authorMap.get(post.authorId) : null;
        const image = post.featuredImageId ? imageMap.get(post.featuredImageId) : null;
        
        return {
          id: post.uuid,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : ''),
          publishedAt: post.publishedAt,
          author: author ? {
            name: `${author.firstName} ${author.lastName}`,
            avatar: author.avatar
          } : null,
          featuredImage: image ? {
            id: image.uuid,
            link: image.link,
            altText: image.altText
          } : null,
          categories: categoriesMap.get(post.id) || []
        };
      });

      res.json({
        success: true,
        data: {
          recommendedPosts: formattedPosts,
          total: formattedPosts.length
        }
      });

    } catch (error: any) {
      console.error('Error fetching recommended posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recommended posts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}