'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_images', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      propertyId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'property_id',
        references: {
          model: 'properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'file_name'
      },
      originalName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'original_name'
      },
      filePath: {
        type: Sequelize.STRING(500),
        allowNull: false,
        field: 'file_path'
      },
      fileUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
        field: 'file_url'
      },
      cdnUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'cdn_url'
      },
      altText: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'alt_text'
      },
      caption: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fileSize: {
        type: Sequelize.BIGINT,
        allowNull: false,
        field: 'file_size'
      },
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'mime_type'
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isPrimary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_primary'
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
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
    await queryInterface.addIndex('property_images', ['property_id']);
    await queryInterface.addIndex('property_images', ['property_id', 'is_primary']);
    await queryInterface.addIndex('property_images', ['property_id', 'sort_order']);
    await queryInterface.addIndex('property_images', ['is_active']);
    await queryInterface.addIndex('property_images', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_images');
  }
};