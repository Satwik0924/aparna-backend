const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: console.log
  }
);

async function debugPropertyAmenities() {
  try {
    // Test a simple insert to see the exact error
    console.log('Testing property_amenities insert...');
    
    const testId = '12345678-1234-1234-1234-123456789012';
    const testPropertyId = '87654321-4321-4321-4321-210987654321';
    const testAmenityId = '11111111-1111-1111-1111-111111111111';
    
    await sequelize.query(`
      INSERT INTO property_amenities (id, property_id, amenity_id, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
    `, {
      replacements: [testId, testPropertyId, testAmenityId],
      type: Sequelize.QueryTypes.INSERT
    });
    
    console.log('✅ Insert successful');
    
    // Clean up
    await sequelize.query(`DELETE FROM property_amenities WHERE id = ?`, {
      replacements: [testId],
      type: Sequelize.QueryTypes.DELETE
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

debugPropertyAmenities();