'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'building_permission_number', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('properties', 'rera_website', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'building_permission_number');
    await queryInterface.removeColumn('properties', 'rera_website');
  }
};