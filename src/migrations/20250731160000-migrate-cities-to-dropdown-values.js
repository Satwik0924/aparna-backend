'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🚀 Starting city migration to dropdown_values...');
      
      // Step 1: Get the main 'city' category ID
      const [cityCategory] = await queryInterface.sequelize.query(
        `SELECT id FROM dropdown_categories WHERE name = 'city' AND parent_id IS NULL`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );
      
      if (!cityCategory) {
        throw new Error('Main city category not found');
      }
      
      const cityCategoryId = cityCategory.id;
      console.log('✅ Main city category found:', cityCategoryId);
      
      // Step 2: Get all city categories (level 1 cities)
      const cityCategories = await queryInterface.sequelize.query(
        `SELECT id, name, parent_id, sort_order FROM dropdown_categories 
         WHERE parent_id = '${cityCategoryId}' AND level = 1`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );
      
      console.log(`📍 Found ${cityCategories.length} city categories to migrate`);
      
      // Step 3: Get client ID for dropdown_values
      const [client] = await queryInterface.sequelize.query(
        'SELECT id FROM clients LIMIT 1',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );
      
      const clientId = client ? client.id : null;
      console.log('👤 Using client ID:', clientId);
      
      // Step 4: For each city category, create dropdown_value and update area parent_ids
      const cityMappings = [];
      const timestamp = new Date();
      
      for (const cityCategory of cityCategories) {
        console.log(`🏙️  Processing city: ${cityCategory.name}`);
        
        // Create new dropdown_value for this city (preserve UUID)
        await queryInterface.bulkInsert('dropdown_values', [{
          id: cityCategory.id, // PRESERVE SAME UUID
          category_id: cityCategoryId,
          client_id: clientId,
          value: cityCategory.name,
          slug: cityCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sort_order: cityCategory.sort_order || 0,
          is_active: true,
          created_at: timestamp,
          updated_at: timestamp
        }], { transaction });
        
        // Get all areas (dropdown_values) that belong to this city category
        const areas = await queryInterface.sequelize.query(
          `SELECT id FROM dropdown_values WHERE category_id = '${cityCategory.id}'`,
          { type: Sequelize.QueryTypes.SELECT, transaction }
        );
        
        console.log(`   📍 Found ${areas.length} areas for ${cityCategory.name}`);
        
        // Update areas to point to main city category and set parent_id to city value
        if (areas.length > 0) {
          await queryInterface.sequelize.query(
            `UPDATE dropdown_values 
             SET category_id = '${cityCategoryId}', 
                 parent_id = '${cityCategory.id}'
             WHERE category_id = '${cityCategory.id}'`,
            { transaction }
          );
        }
        
        cityMappings.push({
          oldCategoryId: cityCategory.id,
          newValueId: cityCategory.id, // Same UUID
          cityName: cityCategory.name
        });
      }
      
      // Step 5: Update properties table city_id references 
      // (they should already point to correct IDs since we preserved UUIDs)
      console.log('🏠 Checking properties table references...');
      const [propertiesCount] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM properties WHERE city_id IS NOT NULL`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );
      
      console.log(`✅ Found ${propertiesCount.count} properties with city_id - UUIDs preserved`);
      
      // Step 6: Remove old city categories (level 1)
      console.log('🗑️  Removing old city categories...');
      await queryInterface.sequelize.query(
        `DELETE FROM dropdown_categories WHERE parent_id = '${cityCategoryId}' AND level = 1`,
        { transaction }
      );
      
      await transaction.commit();
      console.log('✅ City migration completed successfully!');
      console.log('📊 Migration summary:');
      console.log(`   • Migrated ${cityCategories.length} cities to dropdown_values`);
      console.log(`   • Updated area parent_id references`);
      console.log(`   • Preserved all UUIDs`);
      console.log(`   • Properties references remain intact`);
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Reversing city migration...');
      
      // Get the main city category
      const [cityCategory] = await queryInterface.sequelize.query(
        `SELECT id FROM dropdown_categories WHERE name = 'city' AND parent_id IS NULL`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );
      
      if (!cityCategory) {
        throw new Error('Main city category not found');
      }
      
      const cityCategoryId = cityCategory.id;
      
      // Get all city values (those without parent_id in city category)
      const cities = await queryInterface.sequelize.query(
        `SELECT id, value, sort_order FROM dropdown_values 
         WHERE category_id = '${cityCategoryId}' AND parent_id IS NULL`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );
      
      // Recreate city categories
      const cityCategoriesToCreate = cities.map((city, index) => ({
        id: city.id, // Preserve UUID
        name: city.value,
        description: `${city.value} city`,
        parent_id: cityCategoryId,
        level: 1,
        sort_order: city.sort_order || index,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      await queryInterface.bulkInsert('dropdown_categories', cityCategoriesToCreate, { transaction });
      
      // Update areas back to their city categories
      for (const city of cities) {
        await queryInterface.sequelize.query(
          `UPDATE dropdown_values 
           SET category_id = '${city.id}', parent_id = NULL
           WHERE category_id = '${cityCategoryId}' AND parent_id = '${city.id}'`,
          { transaction }
        );
      }
      
      // Remove city values from dropdown_values
      await queryInterface.sequelize.query(
        `DELETE FROM dropdown_values 
         WHERE category_id = '${cityCategoryId}' AND parent_id IS NULL`,
        { transaction }
      );
      
      await transaction.commit();
      console.log('✅ Migration reversal completed');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration reversal failed:', error);
      throw error;
    }
  }
};