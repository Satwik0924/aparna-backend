'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if properties already exist
    const existingProperties = await queryInterface.sequelize.query(
      "SELECT slug FROM properties WHERE slug IN ('aparna-sarovar-zenith', 'aparna-westside', 'prestige-lakeside-habitat')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingProperties.length > 0) {
      console.log('Properties already exist, skipping seeding');
      return;
    }

    // Get client IDs and dropdown values
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const dropdownValues = await queryInterface.sequelize.query(
      'SELECT dv.id, dv.value, dc.name as category_name FROM dropdown_values dv JOIN dropdown_categories dc ON dv.category_id = dc.id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const apartmentType = dropdownValues.find(dv => dv.value === 'Apartment' && dv.category_name === 'property_types');
    const villaType = dropdownValues.find(dv => dv.value === 'Villa' && dv.category_name === 'property_types');
    const plotType = dropdownValues.find(dv => dv.value === 'Plot' && dv.category_name === 'property_types');
    const commercialType = dropdownValues.find(dv => dv.value === 'Commercial' && dv.category_name === 'property_types');

    const availableStatus = dropdownValues.find(dv => dv.value === 'Available' && dv.category_name === 'property_status');
    const soldStatus = dropdownValues.find(dv => dv.value === 'Sold' && dv.category_name === 'property_status');
    const underConstructionStatus = dropdownValues.find(dv => dv.value === 'Under Construction' && dv.category_name === 'property_status');

    // Additional dropdown values
    const hyderabadCity = dropdownValues.find(dv => dv.value === 'Hyderabad' && dv.category_name === 'city');
    const bangaloreCity = dropdownValues.find(dv => dv.value === 'Bangalore' && dv.category_name === 'city');
    const mumbaiCity = dropdownValues.find(dv => dv.value === 'Mumbai' && dv.category_name === 'city');

    const threeBhkConfig = dropdownValues.find(dv => dv.value === '3 BHK' && dv.category_name === 'configurations');
    const fourBhkConfig = dropdownValues.find(dv => dv.value === '4 BHK' && dv.category_name === 'configurations');
    const villaConfig = dropdownValues.find(dv => dv.value === 'Villa' && dv.category_name === 'configurations');
    const twoBhkConfig = dropdownValues.find(dv => dv.value === '2 BHK' && dv.category_name === 'configurations');

    const priceRange1to2Cr = dropdownValues.find(dv => dv.value === '₹1 - ₹2 Crores' && dv.category_name === 'price_range');
    const priceRange2to5Cr = dropdownValues.find(dv => dv.value === '₹2 - ₹5 Crores' && dv.category_name === 'price_range');
    const priceRange50LTo1Cr = dropdownValues.find(dv => dv.value === '₹50 Lakhs - ₹1 Crore' && dv.category_name === 'price_range');

    // Areas (we'll need to check if area dropdown values exist)
    const nallagandlaArea = dropdownValues.find(dv => dv.value === 'Nallagandla' && dv.category_name === 'areas');
    const mokilaArea = dropdownValues.find(dv => dv.value === 'Mokila' && dv.category_name === 'areas');
    const whitefieldArea = dropdownValues.find(dv => dv.value === 'Whitefield' && dv.category_name === 'areas');

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    const properties = [
      // Aparna Constructions Properties
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Aparna Sarovar Zenith',
        slug: 'aparna-sarovar-zenith',
        description: 'Luxury 3 & 4 BHK apartments in the heart of Hyderabad with world-class amenities and stunning views.',
        short_description: 'Luxury 3 & 4 BHK apartments with premium amenities in prime location.',
        price: 8500000.00,
        price_type: 'fixed',
        currency: 'INR',
        property_type_id: apartmentType.id,
        status_id: availableStatus.id,
        address: 'Nallagandla, Serilingampally',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postal_code: '500019',
        latitude: 17.4570,
        longitude: 78.3460,
        area: 2100.00,
        area_unit: 'sq_ft',
        bedrooms: 3,
        bathrooms: 3,
        floors: 12,
        parking_spaces: 2,
        built_year: 2023,
        rera_number: 'P02200002345',
        featured: true,
        is_active: true,
        view_count: 1245,
        inquiry_count: 89,
        seo_title: 'Aparna Sarovar Zenith - Luxury 3 & 4 BHK Apartments in Hyderabad',
        seo_description: 'Discover luxury living at Aparna Sarovar Zenith. Premium 3 & 4 BHK apartments with world-class amenities in Nallagandla, Hyderabad.',
        seo_keywords: 'luxury apartments hyderabad, 3 bhk apartments, 4 bhk apartments, nallagandla properties',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Aparna Hillpark Meadows',
        slug: 'aparna-hillpark-meadows',
        description: 'Spacious villas with private gardens and modern amenities in a serene environment.',
        short_description: 'Spacious villas with private gardens in peaceful surroundings.',
        price: 15000000.00,
        price_type: 'negotiable',
        currency: 'INR',
        property_type_id: villaType.id,
        status_id: underConstructionStatus.id,
        address: 'Mokila, Shankarpalli',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postal_code: '500089',
        latitude: 17.3890,
        longitude: 78.1450,
        area: 3200.00,
        area_unit: 'sq_ft',
        bedrooms: 4,
        bathrooms: 4,
        floors: 2,
        parking_spaces: 3,
        built_year: 2024,
        rera_number: 'P02200002346',
        featured: true,
        is_active: true,
        view_count: 876,
        inquiry_count: 45,
        seo_title: 'Aparna Hillpark Meadows - Luxury Villas in Hyderabad',
        seo_description: 'Experience luxury villa living at Aparna Hillpark Meadows. Spacious 4 BHK villas with private gardens in Mokila, Hyderabad.',
        seo_keywords: 'luxury villas hyderabad, 4 bhk villas, mokila properties, independent houses',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Aparna Cyber Life',
        slug: 'aparna-cyber-life',
        description: 'Modern 2 & 3 BHK apartments designed for IT professionals with easy access to HITEC City.',
        short_description: 'Modern 2 & 3 BHK apartments near HITEC City for IT professionals.',
        price: 6500000.00,
        price_type: 'fixed',
        currency: 'INR',
        property_type_id: apartmentType.id,
        status_id: availableStatus.id,
        address: 'Nallagandla, Serilingampally',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postal_code: '500019',
        latitude: 17.4580,
        longitude: 78.3470,
        area: 1650.00,
        area_unit: 'sq_ft',
        bedrooms: 2,
        bathrooms: 2,
        floors: 8,
        parking_spaces: 1,
        built_year: 2022,
        rera_number: 'P02200002347',
        featured: false,
        is_active: true,
        view_count: 532,
        inquiry_count: 23,
        seo_title: 'Aparna Cyber Life - 2 & 3 BHK Apartments near HITEC City',
        seo_description: 'Modern living at Aparna Cyber Life. 2 & 3 BHK apartments designed for IT professionals near HITEC City, Hyderabad.',
        seo_keywords: '2 bhk apartments hyderabad, 3 bhk apartments, hitec city properties, it professionals',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Group Properties
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Prestige Shantiniketan',
        slug: 'prestige-shantiniketan',
        description: 'Premium residential project with 3 & 4 BHK apartments in the heart of Bangalore.',
        short_description: 'Premium 3 & 4 BHK apartments in prime Bangalore location.',
        price: 12000000.00,
        price_type: 'fixed',
        currency: 'INR',
        property_type_id: apartmentType.id,
        status_id: availableStatus.id,
        address: 'Whitefield, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postal_code: '560066',
        latitude: 12.9698,
        longitude: 77.7500,
        area: 2400.00,
        area_unit: 'sq_ft',
        bedrooms: 3,
        bathrooms: 3,
        floors: 15,
        parking_spaces: 2,
        built_year: 2023,
        rera_number: 'PRM/KA/RERA/1251/446/PR/300823/005196',
        featured: true,
        is_active: true,
        view_count: 987,
        inquiry_count: 67,
        seo_title: 'Prestige Shantiniketan - Premium Apartments in Whitefield, Bangalore',
        seo_description: 'Luxury living at Prestige Shantiniketan. Premium 3 & 4 BHK apartments in Whitefield, Bangalore with world-class amenities.',
        seo_keywords: 'prestige apartments bangalore, whitefield properties, 3 bhk apartments, 4 bhk apartments',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Prestige Glenwood',
        slug: 'prestige-glenwood',
        description: 'Luxury villa community with premium amenities and 24/7 security.',
        short_description: 'Luxury villa community with premium amenities and security.',
        price: 25000000.00,
        price_type: 'negotiable',
        currency: 'INR',
        property_type_id: villaType.id,
        status_id: underConstructionStatus.id,
        address: 'Budigere Cross, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postal_code: '560049',
        latitude: 13.1000,
        longitude: 77.7100,
        area: 4500.00,
        area_unit: 'sq_ft',
        bedrooms: 5,
        bathrooms: 5,
        floors: 2,
        parking_spaces: 4,
        built_year: 2024,
        rera_number: 'PRM/KA/RERA/1251/446/PR/300823/005197',
        featured: true,
        is_active: true,
        view_count: 654,
        inquiry_count: 34,
        seo_title: 'Prestige Glenwood - Luxury Villas in Bangalore',
        seo_description: 'Experience luxury villa living at Prestige Glenwood. Premium 5 BHK villas with world-class amenities in Budigere Cross, Bangalore.',
        seo_keywords: 'luxury villas bangalore, 5 bhk villas, budigere properties, independent houses',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Group Properties
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Lodha Bellissimo',
        slug: 'lodha-bellissimo',
        description: 'Iconic luxury residences with breathtaking views of Mumbai skyline.',
        short_description: 'Iconic luxury residences with stunning Mumbai skyline views.',
        price: 35000000.00,
        price_type: 'fixed',
        currency: 'INR',
        property_type_id: apartmentType.id,
        status_id: availableStatus.id,
        address: 'Mahalaxmi, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '400011',
        latitude: 18.9820,
        longitude: 72.8200,
        area: 3500.00,
        area_unit: 'sq_ft',
        bedrooms: 4,
        bathrooms: 4,
        floors: 42,
        parking_spaces: 3,
        built_year: 2023,
        rera_number: 'P51700000123',
        featured: true,
        is_active: true,
        view_count: 1876,
        inquiry_count: 145,
        seo_title: 'Lodha Bellissimo - Luxury Apartments in Mahalaxmi, Mumbai',
        seo_description: 'Iconic luxury living at Lodha Bellissimo. Premium 4 BHK apartments with stunning views in Mahalaxmi, Mumbai.',
        seo_keywords: 'luxury apartments mumbai, mahalaxmi properties, 4 bhk apartments, mumbai skyline views',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Lodha World One',
        slug: 'lodha-world-one',
        description: 'World\'s tallest residential tower with unparalleled luxury and amenities.',
        short_description: 'World\'s tallest residential tower with unparalleled luxury.',
        price: 85000000.00,
        price_type: 'on_request',
        currency: 'INR',
        property_type_id: apartmentType.id,
        status_id: soldStatus.id,
        address: 'Lower Parel, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '400013',
        latitude: 19.0000,
        longitude: 72.8300,
        area: 5200.00,
        area_unit: 'sq_ft',
        bedrooms: 5,
        bathrooms: 6,
        floors: 117,
        parking_spaces: 4,
        built_year: 2023,
        rera_number: 'P51700000124',
        featured: true,
        is_active: true,
        view_count: 3456,
        inquiry_count: 234,
        seo_title: 'Lodha World One - World\'s Tallest Residential Tower in Mumbai',
        seo_description: 'Experience luxury at new heights at Lodha World One. World\'s tallest residential tower with 5 BHK apartments in Lower Parel, Mumbai.',
        seo_keywords: 'luxury apartments mumbai, tallest residential tower, lower parel properties, 5 bhk apartments',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('properties', properties);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('properties', null, {});
  }
};