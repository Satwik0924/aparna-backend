const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add banner-related columns to properties table
      await queryInterface.addColumn('properties', 'banner_desktop_url', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL for desktop banner image'
      }, { transaction });

      await queryInterface.addColumn('properties', 'banner_mobile_url', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL for mobile banner image'
      }, { transaction });

      await queryInterface.addColumn('properties', 'banner_desktop_alt', {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Alt text for desktop banner image'
      }, { transaction });

      await queryInterface.addColumn('properties', 'banner_mobile_alt', {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Alt text for mobile banner image'
      }, { transaction });

      await queryInterface.addColumn('properties', 'banner_link_url', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL that banner links to when clicked'
      }, { transaction });

      await queryInterface.addColumn('properties', 'banner_link_text', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Text for banner call-to-action button'
      }, { transaction });

      await transaction.commit();
      console.log('✅ Successfully added banner fields to properties table');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Failed to add banner fields:', error.message);
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove banner-related columns from properties table
      await queryInterface.removeColumn('properties', 'banner_desktop_url', { transaction });
      await queryInterface.removeColumn('properties', 'banner_mobile_url', { transaction });
      await queryInterface.removeColumn('properties', 'banner_desktop_alt', { transaction });
      await queryInterface.removeColumn('properties', 'banner_mobile_alt', { transaction });
      await queryInterface.removeColumn('properties', 'banner_link_url', { transaction });
      await queryInterface.removeColumn('properties', 'banner_link_text', { transaction });

      await transaction.commit();
      console.log('✅ Successfully removed banner fields from properties table');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Failed to remove banner fields:', error.message);
      throw error;
    }
  }
};