'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_carousel_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      carousel_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'project_carousels',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('project_carousel_items', ['carousel_id']);
    await queryInterface.addIndex('project_carousel_items', ['property_id']);
    await queryInterface.addIndex('project_carousel_items', ['sort_order']);
    await queryInterface.addIndex('project_carousel_items', ['is_active']);
    
    // Add unique constraint - property can appear only once per carousel
    await queryInterface.addIndex('project_carousel_items', ['carousel_id', 'property_id'], {
      unique: true,
      name: 'unique_carousel_property'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('project_carousel_items');
  }
};