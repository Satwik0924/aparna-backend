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

async function checkTableStructure() {
  try {
    // Check if property_amenities table exists
    const [results] = await sequelize.query("SHOW TABLES LIKE 'property_amenities'");
    
    if (results.length === 0) {
      console.log('❌ property_amenities table does not exist');
      return;
    }
    
    console.log('✅ property_amenities table exists');
    
    // Check table structure
    const [columns] = await sequelize.query("DESCRIBE property_amenities");
    console.log('\n📋 Table structure:');
    console.log(columns);
    
    // Check if property_id column exists
    const propertyIdColumn = columns.find(col => col.Field === 'property_id');
    if (propertyIdColumn) {
      console.log('\n✅ property_id column exists');
    } else {
      console.log('\n❌ property_id column is missing');
      console.log('Available columns:', columns.map(c => c.Field));
    }
    
  } catch (error) {
    console.error('Error checking table structure:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();