'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('seo_metadata', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      entityType: {
        type: Sequelize.ENUM('property', 'content', 'page', 'category', 'tag'),
        allowNull: false,
        field: 'entity_type'
      },
      entityId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'entity_id'
      },
      pageType: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'page_type'
      },
      urlPath: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'url_path'
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
      metaTitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'meta_title'
      },
      metaDescription: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'meta_description'
      },
      metaKeywords: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'meta_keywords'
      },
      ogTitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'og_title'
      },
      ogDescription: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'og_description'
      },
      ogImage: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'og_image'
      },
      ogUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'og_url'
      },
      ogType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'website',
        field: 'og_type'
      },
      twitterTitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'twitter_title'
      },
      twitterDescription: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'twitter_description'
      },
      twitterImage: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'twitter_image'
      },
      twitterCard: {
        type: Sequelize.ENUM('summary', 'summary_large_image', 'app', 'player'),
        allowNull: true,
        defaultValue: 'summary_large_image',
        field: 'twitter_card'
      },
      schemaMarkup: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
        field: 'schema_markup'
      },
      canonicalUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'canonical_url'
      },
      robots: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'index, follow'
      },
      priority: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0.5
      },
      changeFrequency: {
        type: Sequelize.ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'),
        allowNull: true,
        defaultValue: 'monthly',
        field: 'change_frequency'
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
    await queryInterface.addIndex('seo_metadata', ['client_id']);
    await queryInterface.addIndex('seo_metadata', ['entity_type', 'entity_id']);
    await queryInterface.addIndex('seo_metadata', ['entity_type']);
    await queryInterface.addIndex('seo_metadata', ['url_path', 'client_id'], { unique: true });
    await queryInterface.addIndex('seo_metadata', ['page_type']);
    await queryInterface.addIndex('seo_metadata', ['is_active']);
    await queryInterface.addIndex('seo_metadata', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('seo_metadata');
  }
};