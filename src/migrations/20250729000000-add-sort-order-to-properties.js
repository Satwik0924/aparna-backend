'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('properties', 'sort_order', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Order for displaying properties in lists'
    });

    // Create index for sort_order for better query performance
    await queryInterface.addIndex('properties', ['sort_order'], {
      name: 'properties_sort_order_idx'
    });

    // Set initial sort_order based on created_at (newest first gets lower sort_order)
    await queryInterface.sequelize.query(`
      UPDATE properties 
      SET sort_order = (
        SELECT ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY created_at DESC) 
        FROM (SELECT id, client_id, created_at FROM properties) AS p 
        WHERE p.id = properties.id
      )
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('properties', 'properties_sort_order_idx');
    await queryInterface.removeColumn('properties', 'sort_order');
  }
};