'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('property_location_highlights', {
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
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'property_location_highlights',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Name of primary/secondary category',
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Value content for leaf nodes (e.g., "Metro Station - 500m")',
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
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1=Primary, 2=Secondary, 3=Value',
        validate: {
          min: 1,
          max: 3,
        },
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
    await queryInterface.addIndex('property_location_highlights', ['property_id']);
    await queryInterface.addIndex('property_location_highlights', ['parent_id']);
    await queryInterface.addIndex('property_location_highlights', ['property_id', 'level']);
    await queryInterface.addIndex('property_location_highlights', ['property_id', 'parent_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('property_location_highlights');
  }
};