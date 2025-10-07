'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add parent_id column to dropdown_values table
    await queryInterface.addColumn('dropdown_values', 'parent_id', {
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
    await queryInterface.addIndex('dropdown_values', ['parent_id'], {
      name: 'idx_dropdown_values_parent_id'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('dropdown_values', 'idx_dropdown_values_parent_id');

    // Remove column
    await queryInterface.removeColumn('dropdown_values', 'parent_id');
  }
};