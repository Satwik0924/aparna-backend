'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if categories already exist
    const existingCategories = await queryInterface.sequelize.query(
      "SELECT name FROM dropdown_categories WHERE name IN ('property_types', 'property_status', 'amenities', 'facing_directions', 'bhk_types')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingCategories.length > 0) {
      console.log('Dropdown categories already exist, skipping seeding');
      return;
    }

    const categories = [
      {
        id: uuidv4(),
        name: 'property_types',
        description: 'Property types like Apartment, Villa, Plot, Commercial',
        is_client_customizable: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'property_status',
        description: 'Property status like Available, Sold, Under Construction',
        is_client_customizable: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'amenities',
        description: 'Property amenities like Swimming Pool, Gym, Parking',
        is_client_customizable: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'facing_directions',
        description: 'Property facing directions',
        is_client_customizable: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'bhk_types',
        description: 'BHK types like Studio, 1BHK, 2BHK, 3BHK',
        is_client_customizable: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('dropdown_categories', categories);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('dropdown_categories', null, {});
  }
};