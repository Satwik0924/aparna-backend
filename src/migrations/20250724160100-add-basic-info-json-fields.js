'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'basic_section_data', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Stores section title and texts for Basic Info tab'
    });

    await queryInterface.addColumn('properties', 'basic_dynamic_fields', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Stores dynamic key-value pairs for Basic Info tab'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'basic_section_data');
    await queryInterface.removeColumn('properties', 'basic_dynamic_fields');
  }
};