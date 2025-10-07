'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'videos', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of video objects with url and title'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'videos');
  }
};