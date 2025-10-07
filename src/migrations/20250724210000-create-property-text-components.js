'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('property_text_components', {
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Optional title/heading for the text component',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Main text content of the component',
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
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order of display (ascending)',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this component is active/visible',
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

    // Add indexes for better performance
    await queryInterface.addIndex('property_text_components', ['property_id']);
    await queryInterface.addIndex('property_text_components', ['property_id', 'sort_order']);
    await queryInterface.addIndex('property_text_components', ['property_id', 'is_active']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('property_text_components');
  }
};