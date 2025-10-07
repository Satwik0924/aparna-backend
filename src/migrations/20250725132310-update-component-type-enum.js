'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // MySQL doesn't support direct enum modification, so we need to use raw SQL
    await queryInterface.sequelize.query(`
      ALTER TABLE property_images 
      MODIFY COLUMN component_type 
      ENUM('gallery', 'misc', 'banner', 'logo', 'floor_plan', 'layout', 'desktop_carousel', 'mobile_carousel') 
      DEFAULT 'gallery'
    `);
  },

  async down (queryInterface, Sequelize) {
    // Revert to original enum values
    await queryInterface.sequelize.query(`
      ALTER TABLE property_images 
      MODIFY COLUMN component_type 
      ENUM('gallery', 'misc', 'banner', 'logo', 'floor_plan', 'layout') 
      DEFAULT 'gallery'
    `);
  }
};