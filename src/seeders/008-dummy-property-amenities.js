'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if property amenities already exist
    const existingAmenities = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM property_amenities",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingAmenities[0].count > 0) {
      console.log('Property amenities already exist, skipping seeding');
      return;
    }

    // Get properties and amenities
    const properties = await queryInterface.sequelize.query(
      'SELECT id, name FROM properties',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const amenities = await queryInterface.sequelize.query(
      'SELECT dv.id, dv.value FROM dropdown_values dv JOIN dropdown_categories dc ON dv.category_id = dc.id WHERE dc.name = \'amenities\'',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Check if we have the required data
    if (properties.length === 0) {
      console.log('No properties found, skipping property amenities seeding');
      return;
    }

    if (amenities.length === 0) {
      console.log('No amenities found, skipping property amenities seeding');
      return;
    }

    const swimmingPool = amenities.find(a => a.value === 'Swimming Pool');
    const gymnasium = amenities.find(a => a.value === 'Gymnasium');
    const parking = amenities.find(a => a.value === 'Parking');
    const security = amenities.find(a => a.value === '24/7 Security');
    const playArea = amenities.find(a => a.value === 'Children\'s Play Area');
    const clubhouse = amenities.find(a => a.value === 'Clubhouse');
    const garden = amenities.find(a => a.value === 'Landscaped Garden');

    // Check if required amenities exist
    const requiredAmenities = [swimmingPool, gymnasium, parking, security, playArea, clubhouse, garden];
    const missingAmenities = requiredAmenities.filter(amenity => !amenity);
    if (missingAmenities.length > 0) {
      console.log('Some required amenities not found, skipping property amenities seeding');
      return;
    }

    const propertyAmenities = [];
    const addedAmenities = new Set();

    // Add amenities to each property
    properties.forEach(property => {
      // All properties get parking and security
      const parkingKey = `${property.id}-${parking.id}`;
      if (!addedAmenities.has(parkingKey)) {
        propertyAmenities.push({
          id: uuidv4(),
          property_id: property.id,
          amenity_id: parking.id,
          created_at: new Date(),
          updated_at: new Date()
        });
        addedAmenities.add(parkingKey);
      }

      const securityKey = `${property.id}-${security.id}`;
      if (!addedAmenities.has(securityKey)) {
        propertyAmenities.push({
          id: uuidv4(),
          property_id: property.id,
          amenity_id: security.id,
          created_at: new Date(),
          updated_at: new Date()
        });
        addedAmenities.add(securityKey);
      }

      // Luxury properties get more amenities
      if (property.name.includes('Sarovar Zenith') || property.name.includes('Shantiniketan') || property.name.includes('Bellissimo') || property.name.includes('World One')) {
        const swimmingPoolKey = `${property.id}-${swimmingPool.id}`;
        if (!addedAmenities.has(swimmingPoolKey)) {
          propertyAmenities.push({
            id: uuidv4(),
            property_id: property.id,
            amenity_id: swimmingPool.id,
            created_at: new Date(),
            updated_at: new Date()
          });
          addedAmenities.add(swimmingPoolKey);
        }

        const gymnasiumKey = `${property.id}-${gymnasium.id}`;
        if (!addedAmenities.has(gymnasiumKey)) {
          propertyAmenities.push({
            id: uuidv4(),
            property_id: property.id,
            amenity_id: gymnasium.id,
            created_at: new Date(),
            updated_at: new Date()
          });
          addedAmenities.add(gymnasiumKey);
        }

        const clubhouseKey = `${property.id}-${clubhouse.id}`;
        if (!addedAmenities.has(clubhouseKey)) {
          propertyAmenities.push({
            id: uuidv4(),
            property_id: property.id,
            amenity_id: clubhouse.id,
            created_at: new Date(),
            updated_at: new Date()
          });
          addedAmenities.add(clubhouseKey);
        }
      }

      // Villa properties get gardens and play areas
      if (property.name.includes('Hillpark') || property.name.includes('Glenwood')) {
        const gardenKey = `${property.id}-${garden.id}`;
        if (!addedAmenities.has(gardenKey)) {
          propertyAmenities.push({
            id: uuidv4(),
            property_id: property.id,
            amenity_id: garden.id,
            created_at: new Date(),
            updated_at: new Date()
          });
          addedAmenities.add(gardenKey);
        }

        const playAreaKey = `${property.id}-${playArea.id}`;
        if (!addedAmenities.has(playAreaKey)) {
          propertyAmenities.push({
            id: uuidv4(),
            property_id: property.id,
            amenity_id: playArea.id,
            created_at: new Date(),
            updated_at: new Date()
          });
          addedAmenities.add(playAreaKey);
        }
      }

      // Some properties get additional amenities
      if (property.name.includes('Cyber Life') || property.name.includes('Hillpark')) {
        const gymnasiumKey = `${property.id}-${gymnasium.id}`;
        if (!addedAmenities.has(gymnasiumKey)) {
          propertyAmenities.push({
            id: uuidv4(),
            property_id: property.id,
            amenity_id: gymnasium.id,
            created_at: new Date(),
            updated_at: new Date()
          });
          addedAmenities.add(gymnasiumKey);
        }
      }
    });

    await queryInterface.bulkInsert('property_amenities', propertyAmenities);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('property_amenities', null, {});
  }
};