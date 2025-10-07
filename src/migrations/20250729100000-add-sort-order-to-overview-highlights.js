'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('property_overview_highlights', 'sort_order', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Order for displaying overview highlights in lists'
    });

    // Create index for sort_order for better query performance
    await queryInterface.addIndex('property_overview_highlights', ['sort_order'], {
      name: 'property_overview_highlights_sort_order_idx'
    });

    // Set initial sort_order based on created_at (oldest first gets lower sort_order)
    await queryInterface.sequelize.query(`
      UPDATE property_overview_highlights 
      SET sort_order = (
        SELECT ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY created_at ASC) 
        FROM (SELECT id, property_id, created_at FROM property_overview_highlights) AS p 
        WHERE p.id = property_overview_highlights.id
      )
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('property_overview_highlights', 'property_overview_highlights_sort_order_idx');
    await queryInterface.removeColumn('property_overview_highlights', 'sort_order');
  }
};