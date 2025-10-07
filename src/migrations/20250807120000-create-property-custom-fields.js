'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create property_custom_fields table
      await queryInterface.createTable('property_custom_fields', {
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
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        field_key_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'dropdown_values',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          comment: 'References dropdown_values where category = custom_fields'
        },
        field_value: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        sort_order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
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
      }, {
        transaction,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      });

      // Add indexes for better performance
      await queryInterface.addIndex('property_custom_fields', ['property_id'], {
        name: 'property_custom_fields_property_id_idx',
        transaction
      });

      await queryInterface.addIndex('property_custom_fields', ['field_key_id'], {
        name: 'property_custom_fields_field_key_id_idx', 
        transaction
      });

      await queryInterface.addIndex('property_custom_fields', ['property_id', 'field_key_id'], {
        name: 'property_custom_fields_property_field_idx',
        unique: true,
        where: { deleted_at: null }, // Unique constraint ignoring soft-deleted records
        transaction
      });

      await queryInterface.addIndex('property_custom_fields', ['property_id', 'sort_order'], {
        name: 'property_custom_fields_property_sort_idx',
        transaction
      });

      await queryInterface.addIndex('property_custom_fields', ['is_active'], {
        name: 'property_custom_fields_is_active_idx',
        transaction
      });

      await transaction.commit();
      console.log('✅ property_custom_fields table created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error creating property_custom_fields table:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove indexes first
      await queryInterface.removeIndex('property_custom_fields', 'property_custom_fields_is_active_idx', { transaction });
      await queryInterface.removeIndex('property_custom_fields', 'property_custom_fields_property_sort_idx', { transaction });
      await queryInterface.removeIndex('property_custom_fields', 'property_custom_fields_property_field_idx', { transaction });
      await queryInterface.removeIndex('property_custom_fields', 'property_custom_fields_field_key_id_idx', { transaction });
      await queryInterface.removeIndex('property_custom_fields', 'property_custom_fields_property_id_idx', { transaction });
      
      // Drop table
      await queryInterface.dropTable('property_custom_fields', { transaction });
      
      await transaction.commit();
      console.log('✅ property_custom_fields table dropped successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error dropping property_custom_fields table:', error);
      throw error;
    }
  }
};