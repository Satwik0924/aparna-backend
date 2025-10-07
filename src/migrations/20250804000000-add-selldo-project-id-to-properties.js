'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Adding selldo_project_id column to properties table...');
      
      // Add the selldo_project_id column
      await queryInterface.addColumn('properties', 'selldo_project_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        comment: 'SellDo CRM project ID for integration'
      }, { transaction });
      
      console.log('✅ Added selldo_project_id column to properties table');
      
      // Add an index for the selldo_project_id column for better query performance
      await queryInterface.addIndex('properties', {
        fields: ['selldo_project_id'],
        name: 'properties_selldo_project_id_idx',
        transaction
      });
      
      console.log('✅ Added index on selldo_project_id column');
      
      await transaction.commit();
      console.log('🎉 Successfully added selldo_project_id to properties table');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding selldo_project_id column:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Removing selldo_project_id column from properties table...');
      
      // Remove the index first
      await queryInterface.removeIndex('properties', 'properties_selldo_project_id_idx', { transaction });
      console.log('✅ Removed index on selldo_project_id column');
      
      // Remove the column
      await queryInterface.removeColumn('properties', 'selldo_project_id', { transaction });
      console.log('✅ Removed selldo_project_id column from properties table');
      
      await transaction.commit();
      console.log('✅ Successfully reverted selldo_project_id changes');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing selldo_project_id column:', error);
      throw error;
    }
  }
};