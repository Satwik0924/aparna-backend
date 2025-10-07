require('dotenv').config();
const { Sequelize } = require('sequelize');

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

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const [rolesResult] = await sequelize.query('SELECT COUNT(*) as count FROM roles');
    console.log('Roles count:', rolesResult[0].count);

    const [clientsResult] = await sequelize.query('SELECT COUNT(*) as count FROM clients');
    console.log('Clients count:', clientsResult[0].count);

    const [usersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', usersResult[0].count);

    const [propertiesResult] = await sequelize.query('SELECT COUNT(*) as count FROM properties');
    console.log('Properties count:', propertiesResult[0].count);

    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

checkDatabase();