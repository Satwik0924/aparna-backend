'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if clients already exist
    const existingClients = await queryInterface.sequelize.query(
      "SELECT contact_email FROM clients WHERE contact_email IN ('admin@aparnaconstructions.com', 'contact@prestigegroup.com', 'info@lodhagroup.com')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingClients.length > 0) {
      console.log('Clients already exist, skipping seeding');
      return;
    }

    const clients = [
      {
        id: uuidv4(),
        company_name: 'Aparna Constructions',
        contact_email: 'admin@aparnaconstructions.com',
        contact_phone: '+91 9876543210',
        website: 'https://aparnaconstructions.com',
        address: '123 Business District, Financial Center',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postal_code: '500001',
        api_key: 'ak_live_' + Math.random().toString(36).substring(2, 34),
        api_key_status: 'active',
        subscription_plan: 'enterprise',
        monthly_requests: 2450,
        monthly_requests_limit: 10000,
        bandwidth_usage: 5368709120,
        bandwidth_limit: 107374182400,
        is_active: true,
        subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        company_name: 'Prestige Group',
        contact_email: 'contact@prestigegroup.com',
        contact_phone: '+91 9876543211',
        website: 'https://prestigegroup.com',
        address: '456 Commercial Hub, Tech City',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postal_code: '560001',
        api_key: 'ak_live_' + Math.random().toString(36).substring(2, 34),
        api_key_status: 'active',
        subscription_plan: 'premium',
        monthly_requests: 1200,
        monthly_requests_limit: 5000,
        bandwidth_usage: 2147483648,
        bandwidth_limit: 53687091200,
        is_active: true,
        subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        company_name: 'Lodha Group',
        contact_email: 'info@lodhagroup.com',
        contact_phone: '+91 9876543212',
        website: 'https://lodhagroup.com',
        address: '789 Premium Plaza, Business Bay',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '400001',
        api_key: 'ak_live_' + Math.random().toString(36).substring(2, 34),
        api_key_status: 'active',
        subscription_plan: 'basic',
        monthly_requests: 450,
        monthly_requests_limit: 1000,
        bandwidth_usage: 1073741824,
        bandwidth_limit: 10737418240,
        is_active: true,
        subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('clients', clients);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('clients', {
      company_name: ['Aparna Constructions', 'Prestige Group', 'Lodha Group']
    });
  }
};