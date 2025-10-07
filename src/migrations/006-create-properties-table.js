'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('properties', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      shortDescription: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'short_description'
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      priceType: {
        type: Sequelize.ENUM('fixed', 'negotiable', 'on_request'),
        defaultValue: 'fixed',
        field: 'price_type'
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD'
      },
      propertyTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'property_type_id',
        references: {
          model: 'dropdown_values',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      statusId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'status_id',
        references: {
          model: 'dropdown_values',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      postalCode: {
        type: Sequelize.STRING(20),
        allowNull: true,
        field: 'postal_code'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      area: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      areaUnit: {
        type: Sequelize.ENUM('sq_ft', 'sq_m', 'acres', 'hectares'),
        defaultValue: 'sq_ft',
        field: 'area_unit'
      },
      bedrooms: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      bathrooms: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      floors: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      parkingSpaces: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'parking_spaces'
      },
      builtYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'built_year'
      },
      reraNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: 'rera_number'
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'view_count'
      },
      inquiryCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'inquiry_count'
      },
      seoTitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'seo_title'
      },
      seoDescription: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'seo_description'
      },
      seoKeywords: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'seo_keywords'
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'published_at'
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
    await queryInterface.addIndex('properties', ['client_id']);
    await queryInterface.addIndex('properties', ['slug', 'client_id'], { unique: true });
    await queryInterface.addIndex('properties', ['property_type_id']);
    await queryInterface.addIndex('properties', ['status_id']);
    await queryInterface.addIndex('properties', ['city']);
    await queryInterface.addIndex('properties', ['state']);
    await queryInterface.addIndex('properties', ['country']);
    await queryInterface.addIndex('properties', ['price']);
    await queryInterface.addIndex('properties', ['featured']);
    await queryInterface.addIndex('properties', ['is_active']);
    await queryInterface.addIndex('properties', ['published_at']);
    await queryInterface.addIndex('properties', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('properties');
  }
};