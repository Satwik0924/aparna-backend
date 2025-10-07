'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if tables and columns exist before adding constraints
    const tableInfo = await queryInterface.describeTable('content_items');
    if (tableInfo.featured_image_id) {
      await queryInterface.addConstraint('content_items', {
        fields: ['featured_image_id'],
        type: 'foreign key',
        name: 'fk_content_items_featured_image',
        references: {
          table: 'media_files',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    const bannersTableInfo = await queryInterface.describeTable('banners');
    if (bannersTableInfo.image_id) {
      await queryInterface.addConstraint('banners', {
        fields: ['image_id'],
        type: 'foreign key',
        name: 'fk_banners_image',
        references: {
          table: 'media_files',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    const carouselItemsTableInfo = await queryInterface.describeTable('carousel_items');
    if (carouselItemsTableInfo.image_id) {
      await queryInterface.addConstraint('carousel_items', {
        fields: ['image_id'],
        type: 'foreign key',
        name: 'fk_carousel_items_image',
        references: {
          table: 'media_files',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraints (only if they exist)
    try {
      await queryInterface.removeConstraint('content_items', 'fk_content_items_featured_image');
    } catch (error) {
      console.log('Constraint fk_content_items_featured_image does not exist, skipping');
    }
    
    try {
      await queryInterface.removeConstraint('banners', 'fk_banners_image');
    } catch (error) {
      console.log('Constraint fk_banners_image does not exist, skipping');
    }
    
    try {
      await queryInterface.removeConstraint('carousel_items', 'fk_carousel_items_image');
    } catch (error) {
      console.log('Constraint fk_carousel_items_image does not exist, skipping');
    }
  }
};