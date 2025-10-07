'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('content_tag_mappings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      contentId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'content_id',
        references: {
          model: 'content_items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tagId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'tag_id',
        references: {
          model: 'content_tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.addIndex('content_tag_mappings', ['content_id']);
    await queryInterface.addIndex('content_tag_mappings', ['tag_id']);
    await queryInterface.addIndex('content_tag_mappings', ['content_id', 'tag_id'], { unique: true });
    await queryInterface.addIndex('content_tag_mappings', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('content_tag_mappings');
  }
};