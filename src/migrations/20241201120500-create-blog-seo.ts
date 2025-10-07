'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('blog_seo', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
        allowNull: false,
      },
      client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      meta_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      meta_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      canonical_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      og_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      og_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      og_image_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'blog_media',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      twitter_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      twitter_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      twitter_image_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'blog_media',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      focus_keyword: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    try {
      await queryInterface.addIndex('blog_seo', ['client_id', 'entity_type', 'entity_id'], {
        unique: true,
        name: 'blog_seo_client_entity_unique',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_seo', ['entity_type', 'entity_id'], {
        name: 'blog_seo_entity_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_seo', ['focus_keyword'], {
        name: 'blog_seo_focus_keyword_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_seo', ['og_image_id'], {
        name: 'blog_seo_og_image_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_seo', ['twitter_image_id'], {
        name: 'blog_seo_twitter_image_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }
  },

  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('blog_seo');
  },
};