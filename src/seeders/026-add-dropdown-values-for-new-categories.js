'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get category IDs
    const categories = await queryInterface.sequelize.query(
      "SELECT id, name FROM dropdown_categories WHERE name IN ('city', 'price_range', 'configurations')",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (categories.length === 0) {
      console.log('Categories not found, skipping values seeding');
      return;
    }

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    const valuesToAdd = [];

    // Add city values
    if (categoryMap.city) {
      const cities = [
        { value: 'Hyderabad', slug: 'hyderabad', sortOrder: 1 },
        { value: 'Bangalore', slug: 'bangalore', sortOrder: 2 },
        { value: 'Mumbai', slug: 'mumbai', sortOrder: 3 },
        { value: 'Chennai', slug: 'chennai', sortOrder: 4 },
        { value: 'Pune', slug: 'pune', sortOrder: 5 },
        { value: 'Delhi', slug: 'delhi', sortOrder: 6 },
        { value: 'Gurgaon', slug: 'gurgaon', sortOrder: 7 },
        { value: 'Noida', slug: 'noida', sortOrder: 8 }
      ];

      cities.forEach(city => {
        valuesToAdd.push({
          id: uuidv4(),
          category_id: categoryMap.city,
          client_id: null,
          value: city.value,
          slug: city.slug,
          color: null,
          icon: null,
          sort_order: city.sortOrder,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    }

    // Add price range values
    if (categoryMap.price_range) {
      const priceRanges = [
        { value: 'Under ₹50 Lakhs', slug: 'under-50-lakhs', sortOrder: 1 },
        { value: '₹50 Lakhs - ₹1 Crore', slug: '50-lakhs-1-crore', sortOrder: 2 },
        { value: '₹1 - ₹2 Crores', slug: '1-2-crores', sortOrder: 3 },
        { value: '₹2 - ₹3 Crores', slug: '2-3-crores', sortOrder: 4 },
        { value: '₹3 - ₹5 Crores', slug: '3-5-crores', sortOrder: 5 },
        { value: '₹5 - ₹10 Crores', slug: '5-10-crores', sortOrder: 6 },
        { value: 'Above ₹10 Crores', slug: 'above-10-crores', sortOrder: 7 }
      ];

      priceRanges.forEach(range => {
        valuesToAdd.push({
          id: uuidv4(),
          category_id: categoryMap.price_range,
          client_id: null,
          value: range.value,
          slug: range.slug,
          color: null,
          icon: null,
          sort_order: range.sortOrder,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    }

    // Add configuration values
    if (categoryMap.configurations) {
      const configurations = [
        { value: 'Studio', slug: 'studio', sortOrder: 1 },
        { value: '1 BHK', slug: '1-bhk', sortOrder: 2 },
        { value: '1.5 BHK', slug: '1-5-bhk', sortOrder: 3 },
        { value: '2 BHK', slug: '2-bhk', sortOrder: 4 },
        { value: '2.5 BHK', slug: '2-5-bhk', sortOrder: 5 },
        { value: '3 BHK', slug: '3-bhk', sortOrder: 6 },
        { value: '3.5 BHK', slug: '3-5-bhk', sortOrder: 7 },
        { value: '4 BHK', slug: '4-bhk', sortOrder: 8 },
        { value: '4+ BHK', slug: '4-plus-bhk', sortOrder: 9 },
        { value: 'Penthouse', slug: 'penthouse', sortOrder: 10 },
        { value: 'Villa', slug: 'villa', sortOrder: 11 },
        { value: 'Duplex', slug: 'duplex', sortOrder: 12 }
      ];

      configurations.forEach(config => {
        valuesToAdd.push({
          id: uuidv4(),
          category_id: categoryMap.configurations,
          client_id: null,
          value: config.value,
          slug: config.slug,
          color: null,
          icon: null,
          sort_order: config.sortOrder,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    }

    if (valuesToAdd.length > 0) {
      await queryInterface.bulkInsert('dropdown_values', valuesToAdd);
      console.log(`Added ${valuesToAdd.length} dropdown values`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Get category IDs to remove their values
    const categories = await queryInterface.sequelize.query(
      "SELECT id FROM dropdown_categories WHERE name IN ('city', 'price_range', 'configurations')",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (categories.length > 0) {
      const categoryIds = categories.map(cat => cat.id);
      await queryInterface.bulkDelete('dropdown_values', {
        category_id: categoryIds
      }, {});
    }
  }
};