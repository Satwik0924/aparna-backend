'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('properties', 'video_banner_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Video banner URL (YouTube, Vimeo, etc.)'
    });

    await queryInterface.addColumn('properties', 'video_banner_title', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Video banner title'
    });

    await queryInterface.addColumn('properties', 'video_banner_description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Video banner description'
    });

    // Add index for video banner URL for faster queries
    await queryInterface.addIndex('properties', ['video_banner_url']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('properties', ['video_banner_url']);
    await queryInterface.removeColumn('properties', 'video_banner_description');
    await queryInterface.removeColumn('properties', 'video_banner_title');
    await queryInterface.removeColumn('properties', 'video_banner_url');
  }
};