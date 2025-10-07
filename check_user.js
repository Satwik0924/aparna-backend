const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialectOptions: {
    charset: 'utf8mb4',
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log,
});

async function checkUser() {
  try {
    console.log('Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    console.log('\nLooking for user: 25fbdc3b-3799-42e3-97cb-15237b8f48f3');
    
    const [results] = await sequelize.query(
      "SELECT id, email, is_active FROM users WHERE id = '25fbdc3b-3799-42e3-97cb-15237b8f48f3'"
    );
    
    if (results.length > 0) {
      console.log('✅ User found:', results[0]);
    } else {
      console.log('❌ User NOT found');
      
      // Check if any users exist
      const [allUsers] = await sequelize.query(
        "SELECT id, email FROM users LIMIT 5"
      );
      console.log('\nSample users in database:', allUsers);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUser();