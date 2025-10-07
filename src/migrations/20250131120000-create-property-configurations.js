'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('property_configurations')) {
      console.log('property_configurations table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('property_configurations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      configuration_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'dropdown_values',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      }
    });

    // Add composite unique index to prevent duplicates
    try {
      await queryInterface.addIndex('property_configurations', ['property_id', 'configuration_id'], {
        unique: true,
        name: 'property_configurations_unique_idx'
      });
    } catch (error) {
      console.log('Unique index may already exist:', error.message);
    }

    // Add indexes for performance
    try {
      await queryInterface.addIndex('property_configurations', ['property_id'], {
        name: 'property_configurations_property_id_idx'
      });
    } catch (error) {
      console.log('Property ID index may already exist:', error.message);
    }

    try {
      await queryInterface.addIndex('property_configurations', ['configuration_id'], {
        name: 'property_configurations_configuration_id_idx'
      });
    } catch (error) {
      console.log('Configuration ID index may already exist:', error.message);
    }

    // Migrate existing data from properties.configuration_id to property_configurations
    const [properties] = await queryInterface.sequelize.query(`
      SELECT id, configuration_id 
      FROM properties 
      WHERE configuration_id IS NOT NULL
    `);

    if (properties.length > 0) {
      // Use Sequelize's bulkInsert which handles UUID generation properly
      const configurationData = properties.map(prop => ({
        id: uuidv4(),
        property_id: prop.id,
        configuration_id: prop.configuration_id,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('property_configurations', configurationData);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first (safely)
    try {
      await queryInterface.removeIndex('property_configurations', 'property_configurations_unique_idx');
    } catch (error) {
      console.log('Unique index may not exist:', error.message);
    }
    
    try {
      await queryInterface.removeIndex('property_configurations', 'property_configurations_property_id_idx');
    } catch (error) {
      console.log('Property ID index may not exist:', error.message);
    }
    
    try {
      await queryInterface.removeIndex('property_configurations', 'property_configurations_configuration_id_idx');
    } catch (error) {
      console.log('Configuration ID index may not exist:', error.message);
    }
    
    // Drop the table
    await queryInterface.dropTable('property_configurations');
  }
};