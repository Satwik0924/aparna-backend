'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if dropdown values already exist
    const existingValues = await queryInterface.sequelize.query(
      "SELECT value FROM dropdown_values WHERE value IN ('Apartment', 'Villa', 'Available', 'Sold')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingValues.length > 0) {
      console.log('Dropdown values already exist, skipping seeding');
      return;
    }

    // Get dropdown categories
    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM dropdown_categories',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const propertyTypesCategory = categories.find(c => c.name === 'property_types');
    const propertyStatusCategory = categories.find(c => c.name === 'property_status');
    const amenitiesCategory = categories.find(c => c.name === 'amenities');
    const facingDirectionsCategory = categories.find(c => c.name === 'facing_directions');
    const bhkTypesCategory = categories.find(c => c.name === 'bhk_types');

    const dropdownValues = [
      // Property Types
      {
        id: uuidv4(),
        category_id: propertyTypesCategory.id,
        client_id: null,
        value: 'Apartment',
        slug: 'apartment',
        color: '#3B82F6',
        icon: 'building',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: propertyTypesCategory.id,
        client_id: null,
        value: 'Villa',
        slug: 'villa',
        color: '#10B981',
        icon: 'home',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: propertyTypesCategory.id,
        client_id: null,
        value: 'Plot',
        slug: 'plot',
        color: '#F59E0B',
        icon: 'map',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: propertyTypesCategory.id,
        client_id: null,
        value: 'Commercial',
        slug: 'commercial',
        color: '#8B5CF6',
        icon: 'office-building',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: propertyTypesCategory.id,
        client_id: null,
        value: 'Duplex',
        slug: 'duplex',
        color: '#EF4444',
        icon: 'home-modern',
        sort_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Property Status
      {
        id: uuidv4(),
        category_id: propertyStatusCategory.id,
        client_id: null,
        value: 'Available',
        slug: 'available',
        color: '#10B981',
        icon: 'check-circle',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: propertyStatusCategory.id,
        client_id: null,
        value: 'Sold',
        slug: 'sold',
        color: '#EF4444',
        icon: 'x-circle',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: propertyStatusCategory.id,
        client_id: null,
        value: 'Under Construction',
        slug: 'under-construction',
        color: '#F59E0B',
        icon: 'cog',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: propertyStatusCategory.id,
        client_id: null,
        value: 'Coming Soon',
        slug: 'coming-soon',
        color: '#8B5CF6',
        icon: 'clock',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Amenities
      {
        id: uuidv4(),
        category_id: amenitiesCategory.id,
        client_id: null,
        value: 'Swimming Pool',
        slug: 'swimming-pool',
        color: '#0EA5E9',
        icon: 'water',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: amenitiesCategory.id,
        client_id: null,
        value: 'Gymnasium',
        slug: 'gymnasium',
        color: '#DC2626',
        icon: 'dumbbell',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: amenitiesCategory.id,
        client_id: null,
        value: 'Parking',
        slug: 'parking',
        color: '#374151',
        icon: 'car',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: amenitiesCategory.id,
        client_id: null,
        value: '24/7 Security',
        slug: '24-7-security',
        color: '#059669',
        icon: 'shield-check',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: amenitiesCategory.id,
        client_id: null,
        value: 'Children\'s Play Area',
        slug: 'childrens-play-area',
        color: '#F59E0B',
        icon: 'puzzle-piece',
        sort_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: amenitiesCategory.id,
        client_id: null,
        value: 'Clubhouse',
        slug: 'clubhouse',
        color: '#8B5CF6',
        icon: 'building-library',
        sort_order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: amenitiesCategory.id,
        client_id: null,
        value: 'Landscaped Garden',
        slug: 'landscaped-garden',
        color: '#10B981',
        icon: 'sparkles',
        sort_order: 7,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Facing Directions
      {
        id: uuidv4(),
        category_id: facingDirectionsCategory.id,
        client_id: null,
        value: 'North',
        slug: 'north',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: facingDirectionsCategory.id,
        client_id: null,
        value: 'South',
        slug: 'south',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: facingDirectionsCategory.id,
        client_id: null,
        value: 'East',
        slug: 'east',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: facingDirectionsCategory.id,
        client_id: null,
        value: 'West',
        slug: 'west',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: facingDirectionsCategory.id,
        client_id: null,
        value: 'North-East',
        slug: 'north-east',
        sort_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: facingDirectionsCategory.id,
        client_id: null,
        value: 'North-West',
        slug: 'north-west',
        sort_order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: facingDirectionsCategory.id,
        client_id: null,
        value: 'South-East',
        slug: 'south-east',
        sort_order: 7,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: facingDirectionsCategory.id,
        client_id: null,
        value: 'South-West',
        slug: 'south-west',
        sort_order: 8,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // BHK Types
      {
        id: uuidv4(),
        category_id: bhkTypesCategory.id,
        client_id: null,
        value: 'Studio',
        slug: 'studio',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: bhkTypesCategory.id,
        client_id: null,
        value: '1 BHK',
        slug: '1-bhk',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: bhkTypesCategory.id,
        client_id: null,
        value: '2 BHK',
        slug: '2-bhk',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: bhkTypesCategory.id,
        client_id: null,
        value: '3 BHK',
        slug: '3-bhk',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: bhkTypesCategory.id,
        client_id: null,
        value: '4 BHK',
        slug: '4-bhk',
        sort_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        category_id: bhkTypesCategory.id,
        client_id: null,
        value: '5+ BHK',
        slug: '5-plus-bhk',
        sort_order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('dropdown_values', dropdownValues);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('dropdown_values', null, {});
  }
};