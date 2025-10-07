'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the city category ID
    const [cityCategory] = await queryInterface.sequelize.query(
      `SELECT id FROM dropdown_categories WHERE name = 'city'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!cityCategory) {
      console.log('City category not found, skipping area values');
      return;
    }

    // Get city dropdown values to set as parents
    const cities = await queryInterface.sequelize.query(
      `SELECT id, value FROM dropdown_values WHERE category_id = '${cityCategory.id}'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const areaValues = [];
    const timestamp = new Date();

    // Map cities to their areas
    const cityAreas = {
      'Hyderabad': ['Gachibowli', 'Hitech City', 'Madhapur', 'Kondapur', 'Kukatpally', 'Jubilee Hills', 'Banjara Hills'],
      'Bengaluru': ['Whitefield', 'Electronic City', 'Koramangala', 'HSR Layout', 'Indiranagar', 'Marathahalli'],
      'Chennai': ['T. Nagar', 'Anna Nagar', 'Velachery', 'OMR', 'ECR', 'Mylapore'],
      'Mumbai': ['Andheri', 'Bandra', 'Powai', 'Lower Parel', 'Worli', 'Juhu'],
      'Pune': ['Hadapsar', 'Hinjewadi', 'Kharadi', 'Wakad', 'Baner', 'Kalyani Nagar']
    };

    // Create area values
    for (const city of cities) {
      if (!city || !city.id) {
        console.log(`Skipping invalid city:`, city);
        continue;
      }
      
      const areas = cityAreas[city.value] || [];
      let sortOrder = 1;
      
      for (const areaName of areas) {
        areaValues.push({
          id: uuidv4(),
          category_id: cityCategory.id,
          parent_id: city.id, // Set city as parent
          value: areaName,
          slug: areaName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sort_order: sortOrder++,
          is_active: true,
          created_at: timestamp,
          updated_at: timestamp
        });
      }
    }

    if (areaValues.length > 0) {
      await queryInterface.bulkInsert('dropdown_values', areaValues, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Get the city category ID
    const [cityCategory] = await queryInterface.sequelize.query(
      `SELECT id FROM dropdown_categories WHERE name = 'city'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (cityCategory) {
      // Delete area values (those with parent_id set)
      await queryInterface.bulkDelete('dropdown_values', {
        category_id: cityCategory.id,
        parent_id: { [Sequelize.Op.ne]: null }
      }, {});
    }
  }
};