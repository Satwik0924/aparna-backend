'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('content_types', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.ENUM('page', 'blog_post', 'landing_page'),
        allowNull: false,
        unique: true
      },
      displayName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'display_name'
      },
      fieldsSchema: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
        field: 'fields_schema'
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
    await queryInterface.addIndex('content_types', ['name'], { unique: true });
    await queryInterface.addIndex('content_types', ['is_active']);
    await queryInterface.addIndex('content_types', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('content_types');
  }
};