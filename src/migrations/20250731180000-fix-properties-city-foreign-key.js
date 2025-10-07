'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Fixing properties.city_id foreign key constraint...');
      
      // Step 1: Drop the existing foreign key constraint that points to dropdown_categories
      await queryInterface.removeConstraint('properties', 'properties_city_id_foreign_idx', { transaction });
      console.log('✅ Dropped old foreign key constraint properties_city_id_foreign_idx');
      
      // Step 2: Add new foreign key constraint pointing to dropdown_values
      await queryInterface.addConstraint('properties', {
        fields: ['city_id'],
        type: 'foreign key',
        name: 'properties_city_id_fkey',
        references: {
          table: 'dropdown_values',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        transaction
      });
      console.log('✅ Added new foreign key constraint properties_city_id_fkey');
      
      await transaction.commit();
      console.log('🎉 Successfully updated properties.city_id foreign key');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error updating foreign key:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Reverting properties.city_id foreign key constraint...');
      
      // Remove the new constraint
      await queryInterface.removeConstraint('properties', 'properties_city_id_fkey', { transaction });
      
      // Add back the old constraint
      await queryInterface.addConstraint('properties', {
        fields: ['city_id'],
        type: 'foreign key',
        name: 'properties_city_id_foreign_idx',
        references: {
          table: 'dropdown_categories',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        transaction
      });
      
      await transaction.commit();
      console.log('✅ Reverted to original foreign key constraint');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error reverting foreign key:', error);
      throw error;
    }
  }
};