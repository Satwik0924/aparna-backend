'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'logo_title', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('properties', 'logo_description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'logo_title');
    await queryInterface.removeColumn('properties', 'logo_description');
  }
};
