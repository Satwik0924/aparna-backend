'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add componentType field to property_images table
    await queryInterface.addColumn('property_images', 'component_type', {
      type: Sequelize.ENUM('gallery', 'misc', 'banner', 'logo', 'floor_plan', 'layout'),
      defaultValue: 'gallery',
      field: 'component_type'
    });

    // Add title field for better image metadata
    await queryInterface.addColumn('property_images', 'title', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    // Add description field for better image metadata
    await queryInterface.addColumn('property_images', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add index for better performance on component_type queries
    await queryInterface.addIndex('property_images', ['property_id', 'component_type']);
    await queryInterface.addIndex('property_images', ['component_type']);
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('property_images', ['property_id', 'component_type']);
    await queryInterface.removeIndex('property_images', ['component_type']);

    // Remove columns
    await queryInterface.removeColumn('property_images', 'description');
    await queryInterface.removeColumn('property_images', 'title');
    await queryInterface.removeColumn('property_images', 'component_type');
  }
};
