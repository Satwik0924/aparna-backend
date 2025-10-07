'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if categories already exist
    const existingCategories = await queryInterface.sequelize.query(
      "SELECT name FROM dropdown_categories WHERE name IN ('city', 'price_range', 'configurations')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const existingNames = existingCategories.map(cat => cat.name);
    const categoriesToAdd = [];

    // Add city if doesn't exist
    if (!existingNames.includes('city')) {
      categoriesToAdd.push({
        id: uuidv4(),
        name: 'city',
        description: 'Cities where properties are available',
        parent_id: null,
        level: 0,
        sort_order: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Add price_range if doesn't exist
    if (!existingNames.includes('price_range')) {
      categoriesToAdd.push({
        id: uuidv4(),
        name: 'price_range',
        description: 'Property price ranges',
        parent_id: null,
        level: 0,
        sort_order: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Add configurations if doesn't exist
    if (!existingNames.includes('configurations')) {
      categoriesToAdd.push({
        id: uuidv4(),
        name: 'configurations',
        description: 'Property configurations like BHK types',
        parent_id: null,
        level: 0,
        sort_order: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    if (categoriesToAdd.length > 0) {
      await queryInterface.bulkInsert('dropdown_categories', categoriesToAdd);
      console.log(`Added ${categoriesToAdd.length} new dropdown categories`);
    } else {
      console.log('All categories already exist, skipping seeding');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('dropdown_categories', {
      name: ['city', 'price_range', 'configurations']
    }, {});
  }
};