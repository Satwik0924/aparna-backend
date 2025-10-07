'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_amenities', {
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
      amenityId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'amenity_id',
        references: {
          model: 'dropdown_values',
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
    await queryInterface.addIndex('property_amenities', ['property_id']);
    await queryInterface.addIndex('property_amenities', ['amenity_id']);
    await queryInterface.addIndex('property_amenities', ['property_id', 'amenity_id'], { unique: true });
    await queryInterface.addIndex('property_amenities', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_amenities');
  }
};