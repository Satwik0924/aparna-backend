'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('blog_post_videos', {
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'blog_posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      video_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'blog_videos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    });

    // Add indexes
    try {
      await queryInterface.addIndex('blog_post_videos', ['post_id'], {
        name: 'blog_post_videos_post_id_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_post_videos', ['video_id'], {
        name: 'blog_post_videos_video_id_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_post_videos', ['post_id', 'display_order'], {
        name: 'blog_post_videos_post_order_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }
  },

  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('blog_post_videos');
  },
};