'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('property_price_ranges')) {
      console.log('property_price_ranges table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('property_price_ranges', {
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
      price_range_id: {
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
      await queryInterface.addIndex('property_price_ranges', ['property_id', 'price_range_id'], {
        unique: true,
        name: 'property_price_ranges_unique_idx'
      });
    } catch (error) {
      console.log('Unique index may already exist:', error.message);
    }

    // Add indexes for performance
    try {
      await queryInterface.addIndex('property_price_ranges', ['property_id'], {
        name: 'property_price_ranges_property_id_idx'
      });
    } catch (error) {
      console.log('Property ID index may already exist:', error.message);
    }

    try {
      await queryInterface.addIndex('property_price_ranges', ['price_range_id'], {
        name: 'property_price_ranges_price_range_id_idx'
      });
    } catch (error) {
      console.log('Price Range ID index may already exist:', error.message);
    }

    // Migrate existing data from properties.price_range_id to property_price_ranges
    const [properties] = await queryInterface.sequelize.query(`
      SELECT id, price_range_id 
      FROM properties 
      WHERE price_range_id IS NOT NULL
    `);

    if (properties.length > 0) {
      // Insert each property price range with a generated UUID
      for (const prop of properties) {
        await queryInterface.sequelize.query(`
          INSERT INTO property_price_ranges (id, property_id, price_range_id, created_at, updated_at)
          VALUES (
            '${uuidv4()}',
            '${prop.id}',
            '${prop.price_range_id}',
            NOW(),
            NOW()
          )
        `);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first (safely)
    try {
      await queryInterface.removeIndex('property_price_ranges', 'property_price_ranges_unique_idx');
    } catch (error) {
      console.log('Unique index may not exist:', error.message);
    }
    
    try {
      await queryInterface.removeIndex('property_price_ranges', 'property_price_ranges_property_id_idx');
    } catch (error) {
      console.log('Property ID index may not exist:', error.message);
    }
    
    try {
      await queryInterface.removeIndex('property_price_ranges', 'property_price_ranges_price_range_id_idx');
    } catch (error) {
      console.log('Price Range ID index may not exist:', error.message);
    }
    
    // Drop the table
    await queryInterface.dropTable('property_price_ranges');
  }
};