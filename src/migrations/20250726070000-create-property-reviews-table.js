'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('property_reviews', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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
      customer_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      designation: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      review_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      customer_photo_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      customer_photo_path: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      customer_photo_alt: {
        type: Sequelize.STRING(255),
        allowNull: true
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
      is_featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('property_reviews', ['property_id']);
    await queryInterface.addIndex('property_reviews', ['property_id', 'is_active']);
    await queryInterface.addIndex('property_reviews', ['property_id', 'sort_order']);
    await queryInterface.addIndex('property_reviews', ['is_featured']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('property_reviews');
  }
};