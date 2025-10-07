'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_recommendations', {
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
      recommended_property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.addIndex('property_recommendations', ['property_id'], {
      name: 'idx_property_recommendations_property_id'
    });

    await queryInterface.addIndex('property_recommendations', ['recommended_property_id'], {
      name: 'idx_property_recommendations_recommended_property_id'
    });

    await queryInterface.addIndex('property_recommendations', ['property_id', 'sort_order'], {
      name: 'idx_property_recommendations_property_sort'
    });

    // Add unique constraint to prevent duplicate recommendations
    await queryInterface.addIndex('property_recommendations', ['property_id', 'recommended_property_id'], {
      name: 'idx_property_recommendations_unique',
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_recommendations');
  }
};