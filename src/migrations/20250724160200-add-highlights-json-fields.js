'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'highlights_section_data', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Stores section title and texts for Highlights tab'
    });

    await queryInterface.addColumn('properties', 'highlights_dynamic_fields', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Stores dynamic key-value pairs for Highlights tab'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'highlights_section_data');
    await queryInterface.removeColumn('properties', 'highlights_dynamic_fields');
  }
};