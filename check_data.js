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
    logging: false
  }
);

async function checkData() {
  try {
    // Check properties count
    const [properties] = await sequelize.query("SELECT COUNT(*) as count FROM properties");
    console.log(`📊 Properties count: ${properties[0].count}`);
    
    // Check dropdown values count for amenities
    const [amenities] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM dropdown_values dv 
      JOIN dropdown_categories dc ON dv.category_id = dc.id 
      WHERE dc.name = 'amenities'
    `);
    console.log(`📊 Amenities count: ${amenities[0].count}`);
    
    // Check property_amenities count
    const [propertyAmenities] = await sequelize.query("SELECT COUNT(*) as count FROM property_amenities");
    console.log(`📊 Property amenities count: ${propertyAmenities[0].count}`);
    
    // Check if any data exists
    if (properties[0].count === 0) {
      console.log('\n❌ No properties found - this is likely why the seeder is failing');
    }
    
    if (amenities[0].count === 0) {
      console.log('\n❌ No amenities found - this is likely why the seeder is failing');
    }
    
  } catch (error) {
    console.error('Error checking data:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkData();