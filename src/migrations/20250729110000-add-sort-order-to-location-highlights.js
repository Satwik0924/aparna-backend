'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('property_location_highlights', 'sort_order', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Order for displaying location highlights within their level and parent'
    });

    // Create index for sort_order for better query performance
    await queryInterface.addIndex('property_location_highlights', ['sort_order'], {
      name: 'property_location_highlights_sort_order_idx'
    });

    // Create composite index for parent_id and sort_order for hierarchical ordering
    await queryInterface.addIndex('property_location_highlights', ['parent_id', 'sort_order'], {
      name: 'property_location_highlights_parent_sort_idx'
    });

    // Set initial sort_order based on created_at (oldest first gets lower sort_order)
    // For each parent (including null for top-level), order by created_at
    await queryInterface.sequelize.query(`
      UPDATE property_location_highlights 
      SET sort_order = (
        SELECT ROW_NUMBER() OVER (
          PARTITION BY property_id, COALESCE(parent_id, 'NULL') 
          ORDER BY created_at ASC
        ) 
        FROM (
          SELECT id, property_id, parent_id, created_at 
          FROM property_location_highlights
        ) AS p 
        WHERE p.id = property_location_highlights.id
      )
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('property_location_highlights', 'property_location_highlights_parent_sort_idx');
    await queryInterface.removeIndex('property_location_highlights', 'property_location_highlights_sort_order_idx');
    await queryInterface.removeColumn('property_location_highlights', 'sort_order');
  }
};