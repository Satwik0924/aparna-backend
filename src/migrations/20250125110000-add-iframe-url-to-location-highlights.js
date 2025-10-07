'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('property_location_highlights', 'iframe_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Optional iframe URL for embedding maps, videos, or other content',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('property_location_highlights', 'iframe_url');
  }
};