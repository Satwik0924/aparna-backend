'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Change component_type from ENUM to VARCHAR
    await queryInterface.changeColumn('property_images', 'component_type', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'gallery'
    });
  },

  async down (queryInterface, Sequelize) {
    // Change back to ENUM - this might fail if there are values not in the enum
    await queryInterface.changeColumn('property_images', 'component_type', {
      type: Sequelize.ENUM('gallery', 'misc', 'banner', 'logo', 'floor_plan', 'layout', 'desktop_carousel', 'mobile_carousel'),
      allowNull: false,
      defaultValue: 'gallery'
    });
  }
};