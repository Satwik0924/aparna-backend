'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('property_layouts', {
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
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      file_path: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      cdn_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Add indexes
    await queryInterface.addIndex('property_layouts', ['property_id']);
    await queryInterface.addIndex('property_layouts', ['property_id', 'sort_order']);
    await queryInterface.addIndex('property_layouts', ['is_active']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('property_layouts');
  }
};
