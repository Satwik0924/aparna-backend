'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new dropdown fields to properties table (status_id already exists)
    await queryInterface.addColumn('properties', 'configuration_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'dropdown_values',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('properties', 'city_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'dropdown_values',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('properties', 'price_range_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'dropdown_values',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('properties', ['configuration_id'], {
      name: 'idx_properties_configuration_id'
    });

    await queryInterface.addIndex('properties', ['city_id'], {
      name: 'idx_properties_city_id'
    });

    await queryInterface.addIndex('properties', ['price_range_id'], {
      name: 'idx_properties_price_range_id'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('properties', 'idx_properties_configuration_id');
    await queryInterface.removeIndex('properties', 'idx_properties_city_id');
    await queryInterface.removeIndex('properties', 'idx_properties_price_range_id');

    // Remove columns
    await queryInterface.removeColumn('properties', 'configuration_id');
    await queryInterface.removeColumn('properties', 'city_id');
    await queryInterface.removeColumn('properties', 'price_range_id');
  }
};