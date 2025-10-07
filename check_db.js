const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('aparna_constructions', 'crm_scaledino', 'AVNS_q8CvLz2TY6nVQ1-W08G', {
  host: 'crm-scaledino-apr-2-backup-do-user-3486465-0.i.db.ondigitalocean.com',
  port: 25060,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

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