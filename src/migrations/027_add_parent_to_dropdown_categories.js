'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add parent_id column to dropdown_categories table for hierarchical structure
    await queryInterface.addColumn('dropdown_categories', 'parent_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'dropdown_categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add sort_order column for ordering categories
    await queryInterface.addColumn('dropdown_categories', 'sort_order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Add level column to easily identify primary categories (0) and sub categories (1)
    await queryInterface.addColumn('dropdown_categories', 'level', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '0 = Primary Category, 1 = Sub Category'
    });

    // Add index for parent_id for better query performance
    await queryInterface.addIndex('dropdown_categories', ['parent_id'], {
      name: 'idx_dropdown_categories_parent_id'
    });

    // Add index for level
    await queryInterface.addIndex('dropdown_categories', ['level'], {
      name: 'idx_dropdown_categories_level'
    });

    // Add index for sort_order
    await queryInterface.addIndex('dropdown_categories', ['sort_order'], {
      name: 'idx_dropdown_categories_sort_order'
    });

    // Remove the unique constraint on name since we might have same names under different parents
    await queryInterface.removeIndex('dropdown_categories', ['name']);
    
    // Add composite unique constraint on name + parent_id
    await queryInterface.addIndex('dropdown_categories', ['name', 'parent_id'], {
      unique: true,
      name: 'uk_dropdown_categories_name_parent'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('dropdown_categories', 'idx_dropdown_categories_parent_id');
    await queryInterface.removeIndex('dropdown_categories', 'idx_dropdown_categories_level');
    await queryInterface.removeIndex('dropdown_categories', 'idx_dropdown_categories_sort_order');
    await queryInterface.removeIndex('dropdown_categories', 'uk_dropdown_categories_name_parent');

    // Re-add original unique constraint on name
    await queryInterface.addIndex('dropdown_categories', ['name'], {
      unique: true,
      name: 'dropdown_categories_name'
    });

    // Remove columns
    await queryInterface.removeColumn('dropdown_categories', 'parent_id');
    await queryInterface.removeColumn('dropdown_categories', 'sort_order');
    await queryInterface.removeColumn('dropdown_categories', 'level');
  }
};