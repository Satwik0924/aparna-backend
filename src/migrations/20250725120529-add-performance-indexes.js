'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Main property lookup optimization
    await queryInterface.addIndex('properties', ['slug', 'client_id', 'is_active'], {
      name: 'idx_properties_slug_client_active'
    });

    // Property images optimization
    await queryInterface.addIndex('property_images', ['property_id', 'is_active', 'sort_order'], {
      name: 'idx_property_images_property_active_sort'
    });
    
    await queryInterface.addIndex('property_images', ['property_id', 'file_name'], {
      name: 'idx_property_images_property_filename'
    });

    // Floor plans optimization
    await queryInterface.addIndex('property_floor_plans', ['property_id', 'is_active', 'sort_order'], {
      name: 'idx_floor_plans_property_active_sort'
    });

    // Layouts optimization  
    await queryInterface.addIndex('property_layouts', ['property_id', 'is_active', 'sort_order'], {
      name: 'idx_layouts_property_active_sort'
    });

    // Video testimonials optimization
    await queryInterface.addIndex('property_video_testimonials', ['property_id', 'is_active', 'sort_order'], {
      name: 'idx_video_testimonials_property_active_sort'
    });

    // Amenities highlights optimization
    await queryInterface.addIndex('property_amenities_highlights', ['property_id'], {
      name: 'idx_amenities_highlights_property'
    });

    // Location highlights optimization
    await queryInterface.addIndex('property_location_highlights', ['property_id'], {
      name: 'idx_location_highlights_property'
    });

    // Overview highlights optimization
    await queryInterface.addIndex('property_overview_highlights', ['property_id'], {
      name: 'idx_overview_highlights_property'
    });

    // MediaFile optimization for icon lookups
    await queryInterface.addIndex('media_files', ['id', 'is_active'], {
      name: 'idx_media_files_id_active'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove all indexes
    await queryInterface.removeIndex('properties', 'idx_properties_slug_client_active');
    await queryInterface.removeIndex('property_images', 'idx_property_images_property_active_sort');
    await queryInterface.removeIndex('property_images', 'idx_property_images_property_filename');
    await queryInterface.removeIndex('property_floor_plans', 'idx_floor_plans_property_active_sort');
    await queryInterface.removeIndex('property_layouts', 'idx_layouts_property_active_sort');
    await queryInterface.removeIndex('property_video_testimonials', 'idx_video_testimonials_property_active_sort');
    await queryInterface.removeIndex('property_amenities_highlights', 'idx_amenities_highlights_property');
    await queryInterface.removeIndex('property_location_highlights', 'idx_location_highlights_property');
    await queryInterface.removeIndex('property_overview_highlights', 'idx_overview_highlights_property');
    await queryInterface.removeIndex('media_files', 'idx_media_files_id_active');
  }
};
