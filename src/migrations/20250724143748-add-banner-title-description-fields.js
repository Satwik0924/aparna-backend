'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'banner_desktop_title', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('properties', 'banner_desktop_description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('properties', 'banner_mobile_title', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('properties', 'banner_mobile_description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'banner_desktop_title');
    await queryInterface.removeColumn('properties', 'banner_desktop_description');
    await queryInterface.removeColumn('properties', 'banner_mobile_title');
    await queryInterface.removeColumn('properties', 'banner_mobile_description');
  }
};
