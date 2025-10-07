'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Step 1: First add all possible values (both old and new) to the ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE property_images 
      MODIFY COLUMN component_type 
      ENUM('gallery', 'misc', 'misc-images', 'banner', 'logo', 'floor_plan', 'floor-plans', 'layout', 'layouts', 'desktop_carousel', 'mobile_carousel', 'banner-carousel-desktop', 'banner-carousel-mobile') 
      DEFAULT 'gallery'
    `);

    // Step 2: Update the existing data to use new values
    await queryInterface.sequelize.query(`
      UPDATE property_images 
      SET component_type = CASE
        WHEN component_type = 'misc' THEN 'misc-images'
        WHEN component_type = 'floor_plan' THEN 'floor-plans'
        WHEN component_type = 'layout' THEN 'layouts'
        WHEN component_type = 'desktop_carousel' THEN 'banner-carousel-desktop'
        WHEN component_type = 'mobile_carousel' THEN 'banner-carousel-mobile'
        ELSE component_type
      END
    `);

    // Step 3: Remove old values and keep only new values in the ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE property_images 
      MODIFY COLUMN component_type 
      ENUM('gallery', 'misc-images', 'banner', 'logo', 'floor-plans', 'layouts', 'banner-carousel-desktop', 'banner-carousel-mobile') 
      DEFAULT 'gallery'
    `);
  },

  async down (queryInterface, Sequelize) {
    // Step 1: First add all possible values (both old and new) to the ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE property_images 
      MODIFY COLUMN component_type 
      ENUM('gallery', 'misc', 'misc-images', 'banner', 'logo', 'floor_plan', 'floor-plans', 'layout', 'layouts', 'desktop_carousel', 'mobile_carousel', 'banner-carousel-desktop', 'banner-carousel-mobile') 
      DEFAULT 'gallery'
    `);

    // Step 2: Update the data back to old values
    await queryInterface.sequelize.query(`
      UPDATE property_images 
      SET component_type = CASE
        WHEN component_type = 'misc-images' THEN 'misc'
        WHEN component_type = 'floor-plans' THEN 'floor_plan'
        WHEN component_type = 'layouts' THEN 'layout'
        WHEN component_type = 'banner-carousel-desktop' THEN 'desktop_carousel'
        WHEN component_type = 'banner-carousel-mobile' THEN 'mobile_carousel'
        ELSE component_type
      END
    `);

    // Step 3: Remove new values and keep only old values in the ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE property_images 
      MODIFY COLUMN component_type 
      ENUM('gallery', 'misc', 'banner', 'logo', 'floor_plan', 'layout', 'desktop_carousel', 'mobile_carousel') 
      DEFAULT 'gallery'
    `);
  }
};