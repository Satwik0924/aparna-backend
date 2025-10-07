import { Response } from 'express';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../../utils/database';
import { AuthRequest } from '../../middleware/auth';
import Client from '../../models/Client';
import User from '../../models/User';
import BlogPost from '../../models/BlogPost';
import BlogCategory from '../../models/BlogCategory';
import BlogTag from '../../models/BlogTag';
import BlogVideo from '../../models/BlogVideo';
import BlogMedia from '../../models/BlogMedia';
import BlogSeo from '../../models/BlogSeo';
import BlogPostCategory from '../../models/BlogPostCategory';
import BlogPostTag from '../../models/BlogPostTag';
import BlogPostVideo from '../../models/BlogPostVideo';

interface EditBlogPostBody {
  title?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  status?: 'draft' | 'published' | 'archived';
  isIndexable?: boolean;
  featuredImageId?: string;
  publishedAt?: string;
  categories?: string[];
  tags?: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageId?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImageId?: string;
    focusKeyword?: string;
  };
}

export class BlogPostEditController {
  async editPost(req: AuthRequest, res: Response) {
    let transaction: Transaction | null = null;

    try {
      const user = req.user!;
      const clientId = user.clientId;
      const { id: postId } = req.params;
      const updateData: EditBlogPostBody = req.body;

      // Validate required parameters
      if (!postId) {
        return res.status(400).json({
          success: false,
          message: 'Post ID is required'
        });
      }

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Start transaction
      transaction = await sequelize.transaction();

      // Validate client exists and is active
      const client = await Client.findOne({
        where: { 
          id: clientId,
          isActive: true 
        },
        transaction
      });

      if (!client) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'Invalid or inactive client'
        });
      }

      // Find the blog post
      const post = await BlogPost.findOne({
        where: {
          uuid: postId,
          clientId
        },
        transaction
      });

      if (!post) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      // Build update object
      const postUpdateData: any = {};

      if (updateData.title !== undefined) {
        postUpdateData.title = updateData.title;
      }

      if (updateData.content !== undefined) {
        postUpdateData.content = updateData.content;
      }

      if (updateData.excerpt !== undefined) {
        postUpdateData.excerpt = updateData.excerpt;
      }

      if (updateData.status !== undefined) {
        postUpdateData.status = updateData.status;
      }

      if (updateData.isIndexable !== undefined) {
        postUpdateData.isIndexable = updateData.isIndexable;
      }

      // Handle slug update with uniqueness check
      if (updateData.slug && updateData.slug !== post.slug) {
        const existingPost = await BlogPost.findOne({
          where: {
            clientId,
            slug: updateData.slug,
            uuid: { [Op.ne]: postId }
          },
          transaction
        });

        if (existingPost) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Slug already exists for another post'
          });
        }

        postUpdateData.slug = updateData.slug;
      }

      // Handle featured image
      if (updateData.featuredImageId !== undefined) {
        if (updateData.featuredImageId) {
          const featuredImage = await BlogMedia.findOne({
            where: {
              uuid: updateData.featuredImageId,
              clientId
            },
            transaction
          });

          if (!featuredImage) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: 'Featured image not found'
            });
          }

          postUpdateData.featuredImageId = featuredImage.id;
        } else {
          postUpdateData.featuredImageId = null;
        }
      }

      // Handle published date
      if (updateData.publishedAt !== undefined) {
        postUpdateData.publishedAt = updateData.publishedAt ? new Date(updateData.publishedAt) : null;
      }

      // Auto-set publishedAt when status changes to published
      if (updateData.status === 'published' && !post.publishedAt && !updateData.publishedAt) {
        postUpdateData.publishedAt = new Date();
      }

      // Clear publishedAt when status changes from published
      if (updateData.status && updateData.status !== 'published') {
        postUpdateData.publishedAt = null;
      }

      // Update the post
      if (Object.keys(postUpdateData).length > 0) {
        await post.update(postUpdateData, { transaction });
      }

      // Handle categories
      if (updateData.categories !== undefined) {
        // Remove all existing category associations
        await BlogPostCategory.destroy({
          where: { postId: post.id },
          transaction
        });

        // Add new category associations
        if (updateData.categories && updateData.categories.length > 0) {
          const categories = await BlogCategory.findAll({
            where: {
              uuid: { [Op.in]: updateData.categories },
              clientId
            },
            transaction
          });

          if (categories.length > 0) {
            const categoryAssociations = categories.map(category => ({
              postId: post.id,
              categoryId: category.id
            }));

            await BlogPostCategory.bulkCreate(categoryAssociations, { transaction });
          }
        }
      }

      // Handle tags
      if (updateData.tags !== undefined) {
        // Remove all existing tag associations
        await BlogPostTag.destroy({
          where: { postId: post.id },
          transaction
        });

        // Add new tag associations
        if (updateData.tags && updateData.tags.length > 0) {
          const tags = await BlogTag.findAll({
            where: {
              uuid: { [Op.in]: updateData.tags },
              clientId
            },
            transaction
          });

          if (tags.length > 0) {
            const tagAssociations = tags.map(tag => ({
              postId: post.id,
              tagId: tag.id
            }));

            await BlogPostTag.bulkCreate(tagAssociations, { transaction });
          }
        }
      }

      // Handle videos - REMOVED FOR NOW

      // Handle SEO metadata
      if (updateData.seo) {
        let seoRecord = await BlogSeo.findOne({
          where: {
            clientId,
            entityType: 'post',
            entityId: post.id
          },
          transaction
        });

        const seoData: any = {};
        
        if (updateData.seo.metaTitle !== undefined) seoData.metaTitle = updateData.seo.metaTitle;
        if (updateData.seo.metaDescription !== undefined) seoData.metaDescription = updateData.seo.metaDescription;
        if (updateData.seo.canonicalUrl !== undefined) seoData.canonicalUrl = updateData.seo.canonicalUrl;
        if (updateData.seo.ogTitle !== undefined) seoData.ogTitle = updateData.seo.ogTitle;
        if (updateData.seo.ogDescription !== undefined) seoData.ogDescription = updateData.seo.ogDescription;
        if (updateData.seo.twitterTitle !== undefined) seoData.twitterTitle = updateData.seo.twitterTitle;
        if (updateData.seo.twitterDescription !== undefined) seoData.twitterDescription = updateData.seo.twitterDescription;
        if (updateData.seo.focusKeyword !== undefined) seoData.focusKeyword = updateData.seo.focusKeyword;

        // Handle OG image
        if (updateData.seo.ogImageId !== undefined) {
          if (updateData.seo.ogImageId) {
            const ogImage = await BlogMedia.findOne({
              where: {
                uuid: updateData.seo.ogImageId,
                clientId
              },
              transaction
            });
            seoData.ogImageId = ogImage?.id || null;
          } else {
            seoData.ogImageId = null;
          }
        }

        // Handle Twitter image
        if (updateData.seo.twitterImageId !== undefined) {
          if (updateData.seo.twitterImageId) {
            const twitterImage = await BlogMedia.findOne({
              where: {
                uuid: updateData.seo.twitterImageId,
                clientId
              },
              transaction
            });
            seoData.twitterImageId = twitterImage?.id || null;
          } else {
            seoData.twitterImageId = null;
          }
        }

        if (seoRecord) {
          await seoRecord.update(seoData, { transaction });
        } else if (Object.keys(seoData).length > 0) {
          await BlogSeo.create({
            clientId,
            entityType: 'post',
            entityId: post.id,
            ...seoData
          }, { transaction });
        }
      }

      // Commit transaction
      await transaction.commit();
      transaction = null;

      // Fetch updated post data
      await post.reload();

      // Get all related data in parallel
      const postIds = [post.id];
      const [author, featuredImage, postCategories, postTags, seoData] = await Promise.all([
        // Get author if exists
        post.authorId ? User.findByPk(post.authorId, {
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }) : Promise.resolve(null),

        // Get featured image if exists
        post.featuredImageId ? BlogMedia.findByPk(post.featuredImageId, {
          attributes: ['id', 'uuid', 'fileName', 'spacesKey', 'link', 'altText']
        }) : Promise.resolve(null),

        // Get post-category relationships
        BlogPostCategory.findAll({
          where: { postId: post.id },
          attributes: ['categoryId']
        }),

        // Get post-tag relationships
        BlogPostTag.findAll({
          where: { postId: post.id },
          attributes: ['tagId']
        }),

        // Get SEO data
        BlogSeo.findOne({
          where: {
            clientId,
            entityType: 'post',
            entityId: post.id
          }
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

      // Format response
      const responseData = {
        id: post.uuid,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
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
        categories: categories.map(cat => ({
          id: cat.uuid,
          name: cat.name,
          slug: cat.slug
        })),
        tags: tags.map(tag => ({
          id: tag.uuid,
          name: tag.name,
          slug: tag.slug
        })),
        seo: seoData ? {
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
          canonicalUrl: seoData.canonicalUrl,
          ogTitle: seoData.ogTitle,
          ogDescription: seoData.ogDescription,
          twitterTitle: seoData.twitterTitle,
          twitterDescription: seoData.twitterDescription,
          focusKeyword: seoData.focusKeyword
        } : null,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      };

      res.json({
        success: true,
        message: 'Blog post updated successfully',
        data: responseData
      });

    } catch (error: any) {
      // Rollback transaction if it exists
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('Error rolling back transaction:', rollbackError);
        }
      }

      console.error('Error updating blog post:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to update blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}