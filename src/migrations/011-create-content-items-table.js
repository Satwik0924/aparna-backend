'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('content_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'client_id',
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      typeId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'type_id',
        references: {
          model: 'content_types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      featuredImageId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'featured_image_id'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'scheduled'),
        defaultValue: 'draft'
      },
      seoTitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'seo_title'
      },
      seoDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'seo_description'
      },
      seoKeywords: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'seo_keywords'
      },
      authorId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'author_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'published_at'
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'scheduled_at'
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'view_count'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        field: 'deleted_at'
      }
    });

    // Add indexes
    await queryInterface.addIndex('content_items', ['client_id']);
    await queryInterface.addIndex('content_items', ['type_id']);
    await queryInterface.addIndex('content_items', ['slug', 'client_id'], { unique: true });
    await queryInterface.addIndex('content_items', ['status']);
    await queryInterface.addIndex('content_items', ['published_at']);
    await queryInterface.addIndex('content_items', ['author_id']);
    await queryInterface.addIndex('content_items', ['scheduled_at']);
    await queryInterface.addIndex('content_items', ['is_active']);
    await queryInterface.addIndex('content_items', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('content_items');
  }
};