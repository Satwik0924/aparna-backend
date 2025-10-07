'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_progress_images', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 2000,
          max: 2100
        }
      },
      month: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 12
        }
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      alt: {
        type: Sequelize.STRING(500),
        allowNull: true,
        defaultValue: ''
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: true,
        defaultValue: ''
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('property_progress_images', ['property_id'], {
      name: 'idx_property_progress_images_property_id'
    });

    await queryInterface.addIndex('property_progress_images', ['property_id', 'year', 'month'], {
      name: 'idx_property_progress_images_property_year_month'
    });

    await queryInterface.addIndex('property_progress_images', ['year', 'month'], {
      name: 'idx_property_progress_images_year_month'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_progress_images');
  }
};