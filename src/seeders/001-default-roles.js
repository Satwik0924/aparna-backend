'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if roles already exist
    const existingRoles = await queryInterface.sequelize.query(
      "SELECT name FROM roles WHERE name IN ('Super Admin', 'Client Admin', 'Content Manager', 'Property Manager', 'Viewer')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingRoles.length > 0) {
      console.log('Roles already exist, skipping seeding');
      return;
    }

    const roles = [
      {
        id: uuidv4(),
        name: 'Super Admin',
        description: 'Full system access, client management',
        permissions: JSON.stringify({
          'clients.create': true,
          'clients.read': true,
          'clients.update': true,
          'clients.delete': true,
          'users.create': true,
          'users.read': true,
          'users.update': true,
          'users.delete': true,
          'properties.create': true,
          'properties.read': true,
          'properties.update': true,
          'properties.delete': true,
          'content.create': true,
          'content.read': true,
          'content.update': true,
          'content.delete': true,
          'media.create': true,
          'media.read': true,
          'media.update': true,
          'media.delete': true,
          'settings.manage': true,
          'analytics.view': true
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Client Admin',
        description: 'Full access to client-specific data',
        permissions: JSON.stringify({
          'properties.create': true,
          'properties.read': true,
          'properties.update': true,
          'properties.delete': true,
          'content.create': true,
          'content.read': true,
          'content.update': true,
          'content.delete': true,
          'media.create': true,
          'media.read': true,
          'media.update': true,
          'media.delete': true,
          'users.create': true,
          'users.read': true,
          'users.update': true,
          'analytics.view': true
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Content Manager',
        description: 'Content and media management',
        permissions: JSON.stringify({
          'properties.read': true,
          'properties.update': true,
          'content.create': true,
          'content.read': true,
          'content.update': true,
          'content.delete': true,
          'media.create': true,
          'media.read': true,
          'media.update': true,
          'media.delete': true
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Property Manager',
        description: 'Property-specific management',
        permissions: JSON.stringify({
          'properties.create': true,
          'properties.read': true,
          'properties.update': true,
          'properties.delete': true,
          'media.create': true,
          'media.read': true,
          'media.update': true
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Viewer',
        description: 'Read-only access',
        permissions: JSON.stringify({
          'properties.read': true,
          'content.read': true,
          'media.read': true
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('roles', roles);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};