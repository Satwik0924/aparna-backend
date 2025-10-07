'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_video_testimonials', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id'
        },
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
      testimonial_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      youtube_url: {
        type: Sequelize.STRING(500),
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('property_video_testimonials', ['property_id']);
    await queryInterface.addIndex('property_video_testimonials', ['is_active']);
    await queryInterface.addIndex('property_video_testimonials', ['sort_order']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_video_testimonials');
  }
};