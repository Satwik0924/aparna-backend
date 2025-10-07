'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the existing foreign key constraint on city_id
    await queryInterface.removeConstraint('properties', 'properties_city_id_foreign_idx');
    
    // Add new foreign key constraint pointing to dropdown_categories instead of dropdown_values
    await queryInterface.addConstraint('properties', {
      fields: ['city_id'],
      type: 'foreign key',
      name: 'properties_city_id_foreign_idx',
      references: {
        table: 'dropdown_categories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the corrected foreign key constraint
    await queryInterface.removeConstraint('properties', 'properties_city_id_foreign_idx');
    
    // Add back the original foreign key constraint to dropdown_values
    await queryInterface.addConstraint('properties', {
      fields: ['city_id'],
      type: 'foreign key',
      name: 'properties_city_id_foreign_idx',
      references: {
        table: 'dropdown_values',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};