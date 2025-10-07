'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if users already exist
    const existingUsers = await queryInterface.sequelize.query(
      "SELECT email FROM users WHERE email IN ('superadmin@aparnacms.com', 'raj.sharma@aparnaconstructions.com', 'priya.reddy@aparnaconstructions.com')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingUsers.length > 0) {
      console.log('Users already exist, skipping seeding');
      return;
    }

    // First get the client IDs and role IDs
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients WHERE company_name IN (\'Aparna Constructions\', \'Prestige Group\', \'Lodha Group\')',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles WHERE name IN (\'Super Admin\', \'Client Admin\', \'Content Manager\', \'Property Manager\', \'Viewer\')',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const superAdminRole = roles.find(r => r.name === 'Super Admin');
    const clientAdminRole = roles.find(r => r.name === 'Client Admin');
    const contentManagerRole = roles.find(r => r.name === 'Content Manager');
    const propertyManagerRole = roles.find(r => r.name === 'Property Manager');
    const viewerRole = roles.find(r => r.name === 'Viewer');

    // Check if all required roles exist
    if (!superAdminRole || !clientAdminRole || !contentManagerRole || !propertyManagerRole || !viewerRole) {
      console.log('Required roles not found, skipping user seeding');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = [
      // Super Admin
      {
        id: uuidv4(),
        client_id: null,
        first_name: 'Super',
        last_name: 'Admin',
        email: 'superadmin@aparnacms.com',
        password: hashedPassword,
        role_id: superAdminRole.id,
        phone: '+91 9876543220',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      // Aparna Constructions users
      {
        id: uuidv4(),
        client_id: clients.find(c => c.company_name === 'Aparna Constructions').id,
        first_name: 'Raj',
        last_name: 'Sharma',
        email: 'raj.sharma@aparnaconstructions.com',
        password: hashedPassword,
        role_id: clientAdminRole.id,
        phone: '+91 9876543221',
        is_active: true,
        email_verified_at: new Date(),
        last_login_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: clients.find(c => c.company_name === 'Aparna Constructions').id,
        first_name: 'Priya',
        last_name: 'Reddy',
        email: 'priya.reddy@aparnaconstructions.com',
        password: hashedPassword,
        role_id: contentManagerRole.id,
        phone: '+91 9876543222',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: clients.find(c => c.company_name === 'Aparna Constructions').id,
        first_name: 'Arjun',
        last_name: 'Kumar',
        email: 'arjun.kumar@aparnaconstructions.com',
        password: hashedPassword,
        role_id: propertyManagerRole.id,
        phone: '+91 9876543223',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      // Prestige Group users
      {
        id: uuidv4(),
        client_id: clients.find(c => c.company_name === 'Prestige Group').id,
        first_name: 'Anita',
        last_name: 'Desai',
        email: 'anita.desai@prestigegroup.com',
        password: hashedPassword,
        role_id: clientAdminRole.id,
        phone: '+91 9876543224',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: clients.find(c => c.company_name === 'Prestige Group').id,
        first_name: 'Vikram',
        last_name: 'Singh',
        email: 'vikram.singh@prestigegroup.com',
        password: hashedPassword,
        role_id: propertyManagerRole.id,
        phone: '+91 9876543225',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      // Lodha Group users
      {
        id: uuidv4(),
        client_id: clients.find(c => c.company_name === 'Lodha Group').id,
        first_name: 'Kavya',
        last_name: 'Patel',
        email: 'kavya.patel@lodhagroup.com',
        password: hashedPassword,
        role_id: clientAdminRole.id,
        phone: '+91 9876543226',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: clients.find(c => c.company_name === 'Lodha Group').id,
        first_name: 'Rohit',
        last_name: 'Gupta',
        email: 'rohit.gupta@lodhagroup.com',
        password: hashedPassword,
        role_id: viewerRole.id,
        phone: '+91 9876543227',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: [
        'superadmin@aparnacms.com',
        'raj.sharma@aparnaconstructions.com',
        'priya.reddy@aparnaconstructions.com',
        'arjun.kumar@aparnaconstructions.com',
        'anita.desai@prestigegroup.com',
        'vikram.singh@prestigegroup.com',
        'kavya.patel@lodhagroup.com',
        'rohit.gupta@lodhagroup.com'
      ]
    });
  }
};