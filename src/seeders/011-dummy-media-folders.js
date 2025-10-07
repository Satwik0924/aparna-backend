'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if media folders already exist
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM media_folders",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing.count > 0) {
      console.log('Media folders already exist, skipping seeding');
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

    const mediaFolders = [
      // Root folders for each client
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Root',
        description: 'Root folder for Aparna Constructions media',
        parent_id: null,
        path: '/aparna',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Root',
        description: 'Root folder for Prestige Group media',
        parent_id: null,
        path: '/prestige',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Root',
        description: 'Root folder for Lodha Group media',
        parent_id: null,
        path: '/lodha',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('media_folders', mediaFolders);

    // Get the inserted root folders
    const insertedFolders = await queryInterface.sequelize.query(
      'SELECT id, name, client_id FROM media_folders WHERE parent_id IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaRootFolder = insertedFolders.find(f => f.client_id === aparnaClient.id);
    const prestigeRootFolder = insertedFolders.find(f => f.client_id === prestigeClient.id);
    const lodhaRootFolder = insertedFolders.find(f => f.client_id === lodhaClient.id);

    // Sub-folders for each client
    const subFolders = [
      // Aparna sub-folders
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Properties',
        description: 'Property images and media',
        parent_id: aparnaRootFolder.id,
        path: '/aparna/properties',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Banners',
        description: 'Website banners and hero images',
        parent_id: aparnaRootFolder.id,
        path: '/aparna/banners',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Gallery',
        description: 'General gallery images',
        parent_id: aparnaRootFolder.id,
        path: '/aparna/gallery',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Documents',
        description: 'Legal documents and brochures',
        parent_id: aparnaRootFolder.id,
        path: '/aparna/documents',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige sub-folders
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Properties',
        description: 'Property images and media',
        parent_id: prestigeRootFolder.id,
        path: '/prestige/properties',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Banners',
        description: 'Website banners and hero images',
        parent_id: prestigeRootFolder.id,
        path: '/prestige/banners',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Gallery',
        description: 'General gallery images',
        parent_id: prestigeRootFolder.id,
        path: '/prestige/gallery',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha sub-folders
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Properties',
        description: 'Property images and media',
        parent_id: lodhaRootFolder.id,
        path: '/lodha/properties',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Banners',
        description: 'Website banners and hero images',
        parent_id: lodhaRootFolder.id,
        path: '/lodha/banners',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Luxury Collection',
        description: 'Luxury property showcase images',
        parent_id: lodhaRootFolder.id,
        path: '/lodha/luxury-collection',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('media_folders', subFolders);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('media_folders', null, {});
  }
};