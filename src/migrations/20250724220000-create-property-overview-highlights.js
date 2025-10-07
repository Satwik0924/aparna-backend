'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('property_overview_highlights', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Name of the overview highlight/feature',
      },
      icon_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'media_files',
          key: 'id',
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add index for better performance
    await queryInterface.addIndex('property_overview_highlights', ['property_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('property_overview_highlights');
  }
};