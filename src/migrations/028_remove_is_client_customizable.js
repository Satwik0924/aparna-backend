const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Try to drop the index first (if it exists)
      await queryInterface.removeIndex('dropdown_categories', 'idx_dropdown_categories_is_client_customizable');
    } catch (error) {
      console.log('Index idx_dropdown_categories_is_client_customizable does not exist, skipping...');
    }
    
    try {
      // Remove the is_client_customizable column (if it exists)
      await queryInterface.removeColumn('dropdown_categories', 'is_client_customizable');
    } catch (error) {
      console.log('Column is_client_customizable does not exist, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Add the column back
    await queryInterface.addColumn('dropdown_categories', 'is_client_customizable', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    
    // Recreate the index
    await queryInterface.addIndex('dropdown_categories', ['is_client_customizable'], {
      name: 'idx_dropdown_categories_is_client_customizable'
    });
  }
};