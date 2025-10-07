'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Adding careers_jobs.city_id foreign key constraint...');
      
      // Add new foreign key constraint pointing to dropdown_values
      await queryInterface.addConstraint('careers_jobs', {
        fields: ['city_id'],
        type: 'foreign key',
        name: 'careers_jobs_ibfk_4',
        references: {
          table: 'dropdown_values',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        transaction
      });
      console.log('✅ Added new foreign key constraint careers_jobs_ibfk_4');
      
      await transaction.commit();
      console.log('🎉 Successfully added careers_jobs.city_id foreign key');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding foreign key:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Removing careers_jobs.city_id foreign key constraint...');
      
      // Remove the constraint
      await queryInterface.removeConstraint('careers_jobs', 'careers_jobs_ibfk_4', { transaction });
      
      await transaction.commit();
      console.log('✅ Removed foreign key constraint');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing foreign key:', error);
      throw error;
    }
  }
};