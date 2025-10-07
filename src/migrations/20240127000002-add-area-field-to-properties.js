'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add area dropdown field to properties table
    await queryInterface.addColumn('properties', 'area_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'dropdown_values',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for better query performance
    await queryInterface.addIndex('properties', ['area_id'], {
      name: 'idx_properties_area_id'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('properties', 'idx_properties_area_id');

    // Remove column
    await queryInterface.removeColumn('properties', 'area_id');
  }
};