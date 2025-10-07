'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if menus already exist
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM menus",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing.count > 0) {
      console.log('Menus already exist, skipping seeding');
      return;
    }

    // Get clients
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    const menus = [
      // Aparna Constructions Menus
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Main Navigation',
        description: 'Primary navigation menu for Aparna Constructions website',
        type: 'header',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Footer Menu',
        description: 'Footer navigation menu with company links',
        type: 'footer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Mobile Menu',
        description: 'Mobile responsive navigation menu',
        type: 'custom',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Group Menus
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Main Navigation',
        description: 'Primary navigation menu for Prestige Group website',
        type: 'header',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Footer Menu',
        description: 'Footer navigation with quick links',
        type: 'footer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Services Menu',
        description: 'Services and offerings navigation',
        type: 'sidebar',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Group Menus
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Main Navigation',
        description: 'Primary navigation menu for Lodha Group website',
        type: 'header',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Footer Menu',
        description: 'Footer navigation with corporate links',
        type: 'footer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Luxury Collection Menu',
        description: 'Navigation for luxury property collections',
        type: 'sidebar',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('menus', menus);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('menus', null, {});
  }
};