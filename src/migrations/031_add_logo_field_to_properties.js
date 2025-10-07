'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    
    console.log('Adding logo field to properties table...');
    
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add logo URL field
      await queryInterface.addColumn('properties', 'logo_url', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL for property logo image'
      }, { transaction });

      // Add logo alt text field
      await queryInterface.addColumn('properties', 'logo_alt', {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Alt text for property logo image'
      }, { transaction });

      await transaction.commit();
      console.log('✅ Logo fields added to properties table successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding logo fields:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('Removing logo fields from properties table...');
    
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.removeColumn('properties', 'logo_url', { transaction });
      await queryInterface.removeColumn('properties', 'logo_alt', { transaction });

      await transaction.commit();
      console.log('✅ Logo fields removed from properties table successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing logo fields:', error);
      throw error;
    }
  }
};