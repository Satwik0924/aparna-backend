'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('media_files', {
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
      originalName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'original_name'
      },
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'file_name'
      },
      filePath: {
        type: Sequelize.STRING(500),
        allowNull: false,
        field: 'file_path'
      },
      spacesUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
        field: 'spaces_url'
      },
      cdnUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'cdn_url'
      },
      fileType: {
        type: Sequelize.ENUM('image', 'video', 'document', 'audio', 'other'),
        allowNull: false,
        field: 'file_type'
      },
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'mime_type'
      },
      fileSize: {
        type: Sequelize.BIGINT,
        allowNull: false,
        field: 'file_size'
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      folderId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'folder_id',
        references: {
          model: 'media_folders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      uploadedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'uploaded_by',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
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
    await queryInterface.addIndex('media_files', ['client_id']);
    await queryInterface.addIndex('media_files', ['folder_id']);
    await queryInterface.addIndex('media_files', ['file_type']);
    await queryInterface.addIndex('media_files', ['mime_type']);
    await queryInterface.addIndex('media_files', ['uploaded_by']);
    await queryInterface.addIndex('media_files', ['is_active']);
    await queryInterface.addIndex('media_files', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('media_files');
  }
};