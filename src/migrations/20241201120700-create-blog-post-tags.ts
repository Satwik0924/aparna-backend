'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('blog_post_tags', {
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
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'blog_tags',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    // Add indexes
    try {
      await queryInterface.addIndex('blog_post_tags', ['post_id'], {
        name: 'blog_post_tags_post_id_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_post_tags', ['tag_id'], {
        name: 'blog_post_tags_tag_id_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }
  },

  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('blog_post_tags');
  },
};