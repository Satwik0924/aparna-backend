'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make required fields optional for minimal property creation
    
    // Change price to nullable with default 0
    await queryInterface.changeColumn('properties', 'price', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    });

    // Handle foreign key constraints safely
    try {
      // Try to remove existing foreign key constraints
      const constraints = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
         WHERE TABLE_NAME = 'properties' 
         AND TABLE_SCHEMA = DATABASE() 
         AND COLUMN_NAME IN ('property_type_id', 'status_id') 
         AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      for (const constraint of constraints) {
        try {
          await queryInterface.removeConstraint('properties', constraint.CONSTRAINT_NAME);
          console.log(`Removed constraint: ${constraint.CONSTRAINT_NAME}`);
        } catch (error) {
          console.log(`Could not remove constraint ${constraint.CONSTRAINT_NAME}:`, error.message);
        }
      }
    } catch (error) {
      console.log('Could not query constraints:', error.message);
    }

    // Make propertyTypeId nullable
    await queryInterface.changeColumn('properties', 'property_type_id', {
      type: Sequelize.UUID,
      allowNull: true
    });

    // Make statusId nullable
    await queryInterface.changeColumn('properties', 'status_id', {
      type: Sequelize.UUID,
      allowNull: true
    });

    // Recreate foreign key constraints with SET NULL
    await queryInterface.addConstraint('properties', {
      fields: ['property_type_id'],
      type: 'foreign key',
      name: 'fk_properties_property_type_id',
      references: {
        table: 'dropdown_values',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('properties', {
      fields: ['status_id'],
      type: 'foreign key',
      name: 'fk_properties_status_id',
      references: {
        table: 'dropdown_values',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Make address nullable with default empty string
    await queryInterface.changeColumn('properties', 'address', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: ''
    });

    // Make city nullable with default empty string
    await queryInterface.changeColumn('properties', 'city', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: ''
    });

    // Make state nullable with default empty string
    await queryInterface.changeColumn('properties', 'state', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: ''
    });

    // Make country nullable with default empty string
    await queryInterface.changeColumn('properties', 'country', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: ''
    });

    // Make area nullable with default 0
    await queryInterface.changeColumn('properties', 'area', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes - make fields required again
    
    await queryInterface.changeColumn('properties', 'price', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false
    });

    await queryInterface.changeColumn('properties', 'property_type_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'dropdown_values',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.changeColumn('properties', 'status_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'dropdown_values',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.changeColumn('properties', 'address', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.changeColumn('properties', 'city', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    await queryInterface.changeColumn('properties', 'state', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    await queryInterface.changeColumn('properties', 'country', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    await queryInterface.changeColumn('properties', 'area', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
  }
};