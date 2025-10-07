'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_documents', {
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      documentType: {
        type: Sequelize.ENUM('legal', 'brochure', 'floor_plan', 'rera', 'noc', 'approval', 'other'),
        allowNull: false,
        field: 'document_type'
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_public'
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
    await queryInterface.addIndex('property_documents', ['property_id']);
    await queryInterface.addIndex('property_documents', ['property_id', 'document_type']);
    await queryInterface.addIndex('property_documents', ['is_public']);
    await queryInterface.addIndex('property_documents', ['is_active']);
    await queryInterface.addIndex('property_documents', ['sort_order']);
    await queryInterface.addIndex('property_documents', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_documents');
  }
};