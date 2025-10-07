import { Response } from 'express';
import { Transaction } from 'sequelize';
import { sequelize } from '../../utils/database';
import { AuthRequest } from '../../middleware/auth';
import Client from '../../models/Client';
import BlogPost from '../../models/BlogPost';
import BlogSeo from '../../models/BlogSeo';
import BlogPostCategory from '../../models/BlogPostCategory';
import BlogPostTag from '../../models/BlogPostTag';
import BlogPostVideo from '../../models/BlogPostVideo';

export class BlogPostDeleteController {
  async deletePost(req: AuthRequest, res: Response) {
    let transaction: Transaction | null = null;

    try {
      const user = req.user!;
      const clientId = user.clientId;
      const { id: postId } = req.params;

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

      // Store post data for response before deletion
      const deletedPostData = {
        id: post.uuid,
        title: post.title,
        slug: post.slug,
        status: post.status,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      };

      console.log(`🗑️ Starting deletion of blog post: ${post.title} (${post.uuid})`);

      // Delete all associated records in proper order to avoid foreign key constraints
      
      // 1. Delete SEO metadata
      const deletedSeoCount = await BlogSeo.destroy({
        where: {
          clientId,
          entityType: 'post',
          entityId: post.id
        },
        transaction
      });
      console.log(`📊 Deleted ${deletedSeoCount} SEO records`);

      // 2. Delete category associations
      const deletedCategoryCount = await BlogPostCategory.destroy({
        where: {
          postId: post.id
        },
        transaction
      });
      console.log(`🏷️ Deleted ${deletedCategoryCount} category associations`);

      // 3. Delete tag associations
      const deletedTagCount = await BlogPostTag.destroy({
        where: {
          postId: post.id
        },
        transaction
      });
      console.log(`🔖 Deleted ${deletedTagCount} tag associations`);

      // 4. Delete video associations (if any exist in future)
      const deletedVideoCount = await BlogPostVideo.destroy({
        where: {
          postId: post.id
        },
        transaction
      });
      console.log(`🎥 Deleted ${deletedVideoCount} video associations`);

      // 5. Finally delete the main blog post
      await post.destroy({ transaction });
      console.log(`✅ Deleted main blog post record`);

      // Commit the transaction
      await transaction.commit();
      transaction = null;

      console.log(`🎉 Successfully deleted blog post: ${deletedPostData.title}`);

      // Return success response with deleted post information
      res.json({
        success: true,
        message: 'Blog post deleted successfully',
        data: {
          deletedPost: deletedPostData,
          deletedAssociations: {
            seoRecords: deletedSeoCount,
            categoryAssociations: deletedCategoryCount,
            tagAssociations: deletedTagCount,
            videoAssociations: deletedVideoCount
          },
          deletedAt: new Date().toISOString()
        }
      });

    } catch (error: any) {
      // Rollback transaction if it exists
      if (transaction) {
        try {
          await transaction.rollback();
          console.log('🔄 Transaction rolled back due to error');
        } catch (rollbackError) {
          console.error('❌ Error rolling back transaction:', rollbackError);
        }
      }

      console.error('❌ Error deleting blog post:', error);
      
      // Handle specific database errors
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete blog post due to existing references',
          error: 'FOREIGN_KEY_CONSTRAINT'
        });
      }

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error occurred during deletion',
          error: 'VALIDATION_ERROR'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Bulk delete multiple blog posts
   * Useful for admin operations or cleanup
   */
  async deleteBulkPosts(req: AuthRequest, res: Response) {
    let transaction: Transaction | null = null;

    try {
      const user = req.user!;
      const clientId = user.clientId;
      const { postIds } = req.body;

      // Validate input
      if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Post IDs array is required and must not be empty'
        });
      }

      if (postIds.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete more than 50 posts at once'
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

      // Validate client
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

      // Find all posts to delete
      const postsToDelete = await BlogPost.findAll({
        where: {
          uuid: postIds,
          clientId
        },
        attributes: ['id', 'uuid', 'title', 'slug'],
        transaction
      });

      if (postsToDelete.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'No blog posts found with the provided IDs'
        });
      }

      const postInternalIds = postsToDelete.map(post => post.id);
      const deletedPostsData = postsToDelete.map(post => ({
        id: post.uuid,
        title: post.title,
        slug: post.slug
      }));

      console.log(`🗑️ Starting bulk deletion of ${postsToDelete.length} blog posts`);

      // Delete all associated records in bulk
      const [deletedSeoCount, deletedCategoryCount, deletedTagCount, deletedVideoCount] = await Promise.all([
        // Delete SEO metadata
        BlogSeo.destroy({
          where: {
            clientId,
            entityType: 'post',
            entityId: postInternalIds
          },
          transaction
        }),

        // Delete category associations
        BlogPostCategory.destroy({
          where: {
            postId: postInternalIds
          },
          transaction
        }),

        // Delete tag associations
        BlogPostTag.destroy({
          where: {
            postId: postInternalIds
          },
          transaction
        }),

        // Delete video associations
        BlogPostVideo.destroy({
          where: {
            postId: postInternalIds
          },
          transaction
        })
      ]);

      // Delete the main blog posts
      const deletedPostCount = await BlogPost.destroy({
        where: {
          id: postInternalIds
        },
        transaction
      });

      // Commit transaction
      await transaction.commit();
      transaction = null;

      console.log(`🎉 Successfully bulk deleted ${deletedPostCount} blog posts`);

      res.json({
        success: true,
        message: `Successfully deleted ${deletedPostCount} blog posts`,
        data: {
          deletedPosts: deletedPostsData,
          counts: {
            postsDeleted: deletedPostCount,
            seoRecords: deletedSeoCount,
            categoryAssociations: deletedCategoryCount,
            tagAssociations: deletedTagCount,
            videoAssociations: deletedVideoCount
          },
          deletedAt: new Date().toISOString()
        }
      });

    } catch (error: any) {
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('Error rolling back bulk delete transaction:', rollbackError);
        }
      }

      console.error('Error in bulk delete operation:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete blog posts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Soft delete - changes status to 'archived' instead of actual deletion
   * Useful when you want to hide posts but keep them for potential restoration
   */
  async archivePost(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const clientId = user.clientId;
      const { id: postId } = req.params;

      if (!postId || !clientId) {
        return res.status(400).json({
          success: false,
          message: 'Post ID and Client ID are required'
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

      // Find and archive the post
      const post = await BlogPost.findOne({
        where: {
          uuid: postId,
          clientId
        }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      // Update status to archived
      await post.update({
        status: 'archived',
        publishedAt: null // Clear published date when archiving
      });

      res.json({
        success: true,
        message: 'Blog post archived successfully',
        data: {
          id: post.uuid,
          title: post.title,
          slug: post.slug,
          status: post.status,
          archivedAt: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('Error archiving blog post:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to archive blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}