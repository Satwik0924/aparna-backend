import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import { sequelize } from '../../utils/database';
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
import slugify from 'slugify';

interface CreatePostRequest {
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'archived';
  isIndexable?: boolean;
  featuredImageId?: string;
  publishedAt?: string;
  // SEO fields
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
  // Relationships - Support both names and IDs
  categoryIds?: string[]; // UUIDs (optional)
  tagIds?: string[];     // UUIDs (optional)
  categories?: string[]; // Category names (preferred)
  tags?: string[];       // Tag names (preferred)
}

export class BlogPostController {
  async createPost(req: AuthRequest, res: Response) {
    let transaction: Transaction | null = null;
    
    try {
      // Start transaction
      transaction = await sequelize.transaction();
      
      // Get authenticated user and client
      const user = req.user!;
      const clientId = user.clientId;
      
      if (!clientId) {
        await transaction.rollback();
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

      // Extract and validate request data
      const {
        title,
        slug: customSlug,
        content,
        excerpt,
        status = 'draft',
        isIndexable = true,
        featuredImageId,
        publishedAt,
        // SEO fields
        metaTitle,
        metaDescription,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImageId,
        twitterTitle,
        twitterDescription,
        twitterImageId,
        focusKeyword,
        // Relationships - Support both names and IDs
        categoryIds = [],
        tagIds = [],
        categories: categoryNames = [], // Rename to avoid conflict
        tags: tagNames = []        // Rename to avoid conflict
      }: CreatePostRequest = req.body;

      // Validation
      const validationErrors: string[] = [];
      
      if (!title?.trim()) {
        validationErrors.push('Title is required');
      }
      
      if (title && title.length > 255) {
        validationErrors.push('Title must be 255 characters or less');
      }
      
      if (excerpt && excerpt.length > 300) {
        validationErrors.push('Excerpt must be 300 characters or less');
      }

      // SEO validation
      // if (metaTitle && metaTitle.length > 60) {
      //   validationErrors.push('Meta title should be 60 characters or less for optimal SEO');
      // }
      
      // if (metaDescription && metaDescription.length > 160) {
      //   validationErrors.push('Meta description should be 160 characters or less for optimal SEO');
      // }
      
      if (focusKeyword && focusKeyword.trim().split(/\s+/).length > 4) {
        validationErrors.push('Focus keyword should be 1-4 words maximum');
      }

      if (validationErrors.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: validationErrors
        });
      }

      // Generate unique slug
      let finalSlug = customSlug?.trim();
      if (!finalSlug) {
        finalSlug = slugify(title, { lower: true, strict: true });
      } else {
        finalSlug = slugify(finalSlug, { lower: true, strict: true });
      }

      // Ensure slug is unique
      let slugCounter = 1;
      let uniqueSlug = finalSlug;
      
      while (true) {
        const existingPost = await BlogPost.findOne({
          where: {
            clientId,
            slug: uniqueSlug
          },
          transaction
        });

        if (!existingPost) break;
        
        uniqueSlug = `${finalSlug}-${slugCounter}`;
        slugCounter++;
      }

      // Validate featured image if provided
      let featuredImageDbId: number | undefined;
      if (featuredImageId) {
        const featuredImage = await BlogMedia.findOne({
          where: {
            uuid: featuredImageId,
            clientId
          },
          transaction
        });

        if (!featuredImage) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Invalid featured image ID'
          });
        }

        featuredImageDbId = featuredImage.id;
      }

      // Handle published date
      let publishedDate: Date | null = null;
      if (status === 'published') {
        publishedDate = publishedAt ? new Date(publishedAt) : new Date();
      }

      // Create the blog post
      const blogPost = await BlogPost.create({
        clientId,
        title: title.trim(),
        slug: uniqueSlug,
        content: content?.trim(),
        excerpt: excerpt?.trim(),
        status,
        isIndexable,
        authorId: user.id, // Use user.id directly (should be string UUID)
        featuredImageId: featuredImageDbId,
        publishedAt: publishedDate
      }, { transaction });

      // Handle categories - Support both names and IDs
      let finalCategoryEntities: any[] = [];
      
      // If category names are provided, find or create categories
      if (categoryNames && categoryNames.length > 0) {
        const categoryResults = await Promise.all(
          categoryNames.map(async (categoryName) => {
            const trimmedName = categoryName.trim();
            if (!trimmedName) return null;

            // Try to find existing category first
            let category = await BlogCategory.findOne({
              where: {
                name: trimmedName,
                clientId
              },
              transaction
            });

            // If not found, create new category
            if (!category) {
              const categorySlug = slugify(trimmedName, { lower: true, strict: true });
              
              // Ensure unique slug
              let uniqueCategorySlug = categorySlug;
              let counter = 1;
              while (true) {
                const existingCategory = await BlogCategory.findOne({
                  where: { clientId, slug: uniqueCategorySlug },
                  transaction
                });
                if (!existingCategory) break;
                uniqueCategorySlug = `${categorySlug}-${counter}`;
                counter++;
              }

              category = await BlogCategory.create({
                clientId,
                name: trimmedName,
                slug: uniqueCategorySlug
              }, { transaction });
            }

            return category;
          })
        );

        finalCategoryEntities = categoryResults.filter(Boolean);
      }
      // If category IDs are provided, use them
      else if (categoryIds && categoryIds.length > 0) {
        finalCategoryEntities = await BlogCategory.findAll({
          where: {
            uuid: categoryIds,
            clientId
          },
          transaction
        });

        if (finalCategoryEntities.length !== categoryIds.length) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'One or more category IDs are invalid'
          });
        }
      }

      // Create category associations
      if (finalCategoryEntities.length > 0) {
        const categoryAssociations = finalCategoryEntities.map(category => ({
          postId: blogPost.id,
          categoryId: category.id
        }));

        await BlogPostCategory.bulkCreate(categoryAssociations, { transaction });
      }

      // Handle tags - Support both names and IDs
      let finalTagEntities: any[] = [];
      
      // If tag names are provided, find or create tags
      if (tagNames && tagNames.length > 0) {
        const tagResults = await Promise.all(
          tagNames.map(async (tagName) => {
            const trimmedName = tagName.trim();
            if (!trimmedName) return null;

            // Try to find existing tag first
            let tag = await BlogTag.findOne({
              where: {
                name: trimmedName,
                clientId
              },
              transaction
            });

            // If not found, create new tag
            if (!tag) {
              const tagSlug = slugify(trimmedName, { lower: true, strict: true });
              
              // Ensure unique slug
              let uniqueTagSlug = tagSlug;
              let counter = 1;
              while (true) {
                const existingTag = await BlogTag.findOne({
                  where: { clientId, slug: uniqueTagSlug },
                  transaction
                });
                if (!existingTag) break;
                uniqueTagSlug = `${tagSlug}-${counter}`;
                counter++;
              }

              tag = await BlogTag.create({
                clientId,
                name: trimmedName,
                slug: uniqueTagSlug
              }, { transaction });
            }

            return tag;
          })
        );

        finalTagEntities = tagResults.filter(Boolean);
      }
      // If tag IDs are provided, use them
      else if (tagIds && tagIds.length > 0) {
        finalTagEntities = await BlogTag.findAll({
          where: {
            uuid: tagIds,
            clientId
          },
          transaction
        });

        if (finalTagEntities.length !== tagIds.length) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'One or more tag IDs are invalid'
          });
        }
      }

      // Create tag associations
      if (finalTagEntities.length > 0) {
        const tagAssociations = finalTagEntities.map(tag => ({
          postId: blogPost.id,
          tagId: tag.id
        }));

        await BlogPostTag.bulkCreate(tagAssociations, { transaction });
      }

      // Create SEO metadata if any SEO fields are provided
      const hasSeoData = metaTitle || metaDescription || canonicalUrl || 
                        ogTitle || ogDescription || ogImageId ||
                        twitterTitle || twitterDescription || twitterImageId || 
                        focusKeyword;

      if (hasSeoData) {
        await BlogSeo.create({
          clientId,
          entityType: 'post',
          entityId: blogPost.id,
          metaTitle: metaTitle?.trim(),
          metaDescription: metaDescription?.trim(),
          canonicalUrl: canonicalUrl?.trim(),
          ogTitle: ogTitle?.trim() || metaTitle?.trim(),
          ogDescription: ogDescription?.trim() || metaDescription?.trim(),
          ogImageId: ogImageId ? parseInt(ogImageId) : undefined,
          twitterTitle: twitterTitle?.trim() || ogTitle?.trim() || metaTitle?.trim(),
          twitterDescription: twitterDescription?.trim() || ogDescription?.trim() || metaDescription?.trim(),
          twitterImageId: twitterImageId ? parseInt(twitterImageId) : undefined,
          focusKeyword: focusKeyword?.toLowerCase().trim()
        }, { transaction });
      }

      // Commit transaction
      await transaction.commit();
      transaction = null;

      // Fetch the created post with all relationships for response
      const [createdPost, author, featuredImage, seoData] = await Promise.all([
        // Get the basic post
        BlogPost.findOne({ where: { uuid: blogPost.uuid } }),
        
        // Get author if exists
        blogPost.authorId ? User.findByPk(blogPost.authorId, {
          attributes: ['id', 'firstName', 'lastName', 'email']
        }) : Promise.resolve(null),
        
        // Get featured image if exists
        featuredImageDbId ? BlogMedia.findByPk(featuredImageDbId, {
          attributes: ['uuid', 'fileName', 'spacesKey', 'link', 'altText']
        }) : Promise.resolve(null),
        
        // Get SEO data
        BlogSeo.findOne({
          where: {
            entityType: 'post',
            entityId: blogPost.id
          }
        })
      ]);

      if (!createdPost) {
        return res.status(404).json({
          success: false,
          message: 'Created post not found'
        });
      }

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        data: {
          id: createdPost.uuid,
          title: createdPost.title,
          slug: createdPost.slug,
          content: createdPost.content,
          excerpt: createdPost.excerpt,
          status: createdPost.status,
          isIndexable: createdPost.isIndexable,
          publishedAt: createdPost.publishedAt,
          author: author ? {
            id: author.id, // Use author.id instead of author.uuid
            name: `${author.firstName} ${author.lastName}`,
            email: author.email
          } : null,
          featuredImage: featuredImage ? {
            id: featuredImage.uuid,
            fileName: featuredImage.fileName,
            url: featuredImage.getUrl(),
            altText: featuredImage.altText
          } : null,
          categories: finalCategoryEntities.map((cat: any) => ({
            id: cat.uuid,
            name: cat.name,
            slug: cat.slug
          })),
          tags: finalTagEntities.map((tag: any) => ({
            id: tag.uuid,
            name: tag.name,
            slug: tag.slug
          })),
          seo: seoData ? {
            metaTitle: seoData.metaTitle,
            metaDescription: seoData.metaDescription,
            canonicalUrl: seoData.canonicalUrl,
            focusKeyword: seoData.focusKeyword,
            ogTitle: seoData.ogTitle,
            ogDescription: seoData.ogDescription,
            twitterTitle: seoData.twitterTitle,
            twitterDescription: seoData.twitterDescription
          } : null,
          createdAt: createdPost.createdAt,
          updatedAt: createdPost.updatedAt
        }
      });

    } catch (error: any) {
      // Rollback transaction if still active
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('Error rolling back transaction:', rollbackError);
        }
      }

      console.error('Error creating blog post:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to create blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}