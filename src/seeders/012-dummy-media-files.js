'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if media files already exist
    const [existingFiles] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM media_files",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingFiles.count > 0) {
      console.log('Media files already exist, skipping seeding');
      return;
    }

    // Get clients, folders, and properties
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const mediaFolders = await queryInterface.sequelize.query(
      'SELECT id, name, client_id FROM media_folders WHERE parent_id IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const properties = await queryInterface.sequelize.query(
      'SELECT id, name, client_id FROM properties',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      'SELECT id, first_name, last_name, client_id FROM users WHERE client_id IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    // Get folders for each client
    const aparnaFolders = mediaFolders.filter(f => f.client_id === aparnaClient.id);
    const prestigeFolders = mediaFolders.filter(f => f.client_id === prestigeClient.id);
    const lodhaFolders = mediaFolders.filter(f => f.client_id === lodhaClient.id);

    const aparnaPropertiesFolder = aparnaFolders.find(f => f.name === 'Properties');
    const aparnaBannersFolder = aparnaFolders.find(f => f.name === 'Banners');
    const aparnaGalleryFolder = aparnaFolders.find(f => f.name === 'Gallery');

    const prestigePropertiesFolder = prestigeFolders.find(f => f.name === 'Properties');
    const prestigeBannersFolder = prestigeFolders.find(f => f.name === 'Banners');

    const lodhaPropertiesFolder = lodhaFolders.find(f => f.name === 'Properties');
    const lodhaBannersFolder = lodhaFolders.find(f => f.name === 'Banners');
    const lodhaLuxuryFolder = lodhaFolders.find(f => f.name === 'Luxury Collection');

    // Get sample properties
    const aparnaProperties = properties.filter(p => p.client_id === aparnaClient.id);
    const prestigeProperties = properties.filter(p => p.client_id === prestigeClient.id);
    const lodhaProperties = properties.filter(p => p.client_id === lodhaClient.id);

    // Get users for uploaded_by field
    const aparnaUsers = users.filter(u => u.client_id === aparnaClient.id);
    const prestigeUsers = users.filter(u => u.client_id === prestigeClient.id);
    const lodhaUsers = users.filter(u => u.client_id === lodhaClient.id);

    const mediaFiles = [
      // Aparna Media Files
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        folder_id: aparnaPropertiesFolder.id,
        file_name: 'aparna-sarovar-zenith-exterior.jpg',
        original_name: 'Aparna Sarovar Zenith Exterior View.jpg',
        file_path: '/aparna/properties/aparna-sarovar-zenith-exterior.jpg',
        spaces_url: 'https://aparna-cms-media.s3.amazonaws.com/aparna/properties/aparna-sarovar-zenith-exterior.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 2456789,
        width: 1920,
        height: 1080,
        alt_text: 'Aparna Sarovar Zenith exterior view showing modern architecture',
        caption: 'Stunning exterior view of Aparna Sarovar Zenith luxury apartments',
        description: 'High-resolution exterior photograph showcasing the modern architecture and design of Aparna Sarovar Zenith',
        uploaded_by: aparnaUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        folder_id: aparnaPropertiesFolder.id,
        file_name: 'aparna-sarovar-zenith-amenities.jpg',
        original_name: 'Aparna Sarovar Zenith Amenities.jpg',
        file_path: '/aparna/properties/aparna-sarovar-zenith-amenities.jpg',
        spaces_url: 'https://aparna-cms-media.s3.amazonaws.com/aparna/properties/aparna-sarovar-zenith-amenities.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 1876543,
        width: 1600,
        height: 900,
        alt_text: 'Swimming pool and clubhouse amenities at Aparna Sarovar Zenith',
        caption: 'World-class amenities including swimming pool and clubhouse',
        description: 'Premium amenities available to residents of Aparna Sarovar Zenith',
        uploaded_by: aparnaUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        folder_id: aparnaBannersFolder.id,
        file_name: 'aparna-home-banner.jpg',
        original_name: 'Aparna Home Page Banner.jpg',
        file_path: '/aparna/banners/aparna-home-banner.jpg',
        spaces_url: 'https://aparna-cms-media.s3.amazonaws.com/aparna/banners/aparna-home-banner.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 3456789,
        width: 2400,
        height: 1200,
        alt_text: 'Aparna Constructions - Building Dreams for Over 20 Years',
        caption: 'Welcome to Aparna Constructions - Your trusted real estate partner',
        description: 'Hero banner for Aparna Constructions website homepage',
        uploaded_by: aparnaUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        folder_id: aparnaGalleryFolder.id,
        file_name: 'aparna-awards-gallery.jpg',
        original_name: 'Aparna Awards and Recognition.jpg',
        file_path: '/aparna/gallery/aparna-awards-gallery.jpg',
        spaces_url: 'https://aparna-cms-media.s3.amazonaws.com/aparna/gallery/aparna-awards-gallery.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 1234567,
        width: 1400,
        height: 800,
        alt_text: 'Awards and recognition received by Aparna Constructions',
        caption: 'Industry recognition and awards for excellence in construction',
        description: 'Collection of awards and recognition received by Aparna Constructions over the years',
        uploaded_by: aparnaUsers[1].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Media Files
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        folder_id: prestigePropertiesFolder.id,
        file_name: 'prestige-shantiniketan-tower.jpg',
        original_name: 'Prestige Shantiniketan Tower View.jpg',
        file_path: '/prestige/properties/prestige-shantiniketan-tower.jpg',
        spaces_url: 'https://prestige-cms-media.s3.amazonaws.com/prestige/properties/prestige-shantiniketan-tower.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 2789456,
        width: 1920,
        height: 1280,
        alt_text: 'Prestige Shantiniketan residential towers in Whitefield',
        caption: 'Iconic towers of Prestige Shantiniketan offering premium living',
        description: 'Architectural marvel showcasing the premium residential towers at Prestige Shantiniketan',
        uploaded_by: prestigeUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        folder_id: prestigePropertiesFolder.id,
        file_name: 'prestige-glenwood-villas.jpg',
        original_name: 'Prestige Glenwood Villa Community.jpg',
        file_path: '/prestige/properties/prestige-glenwood-villas.jpg',
        spaces_url: 'https://prestige-cms-media.s3.amazonaws.com/prestige/properties/prestige-glenwood-villas.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 3123456,
        width: 2000,
        height: 1200,
        alt_text: 'Luxury villa community at Prestige Glenwood',
        caption: 'Exclusive villa community offering luxury living with privacy',
        description: 'Premium villa community showcasing luxury living spaces at Prestige Glenwood',
        uploaded_by: prestigeUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        folder_id: prestigeBannersFolder.id,
        file_name: 'prestige-home-banner.jpg',
        original_name: 'Prestige Group Home Banner.jpg',
        file_path: '/prestige/banners/prestige-home-banner.jpg',
        spaces_url: 'https://prestige-cms-media.s3.amazonaws.com/prestige/banners/prestige-home-banner.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 4567890,
        width: 2560,
        height: 1440,
        alt_text: 'Prestige Group - Excellence in Real Estate Development',
        caption: 'Three decades of excellence in creating lifestyle destinations',
        description: 'Hero banner showcasing Prestige Group\'s commitment to excellence in real estate',
        uploaded_by: prestigeUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Media Files
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        folder_id: lodhaPropertiesFolder.id,
        file_name: 'lodha-bellissimo-skyline.jpg',
        original_name: 'Lodha Bellissimo Mumbai Skyline.jpg',
        file_path: '/lodha/properties/lodha-bellissimo-skyline.jpg',
        spaces_url: 'https://lodha-cms-media.s3.amazonaws.com/lodha/properties/lodha-bellissimo-skyline.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 3789456,
        width: 2400,
        height: 1350,
        alt_text: 'Lodha Bellissimo with stunning Mumbai skyline views',
        caption: 'Iconic luxury residences offering breathtaking Mumbai skyline views',
        description: 'Spectacular view of Lodha Bellissimo against the backdrop of Mumbai\'s glittering skyline',
        uploaded_by: lodhaUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        folder_id: lodhaPropertiesFolder.id,
        file_name: 'lodha-world-one-tower.jpg',
        original_name: 'Lodha World One Tallest Tower.jpg',
        file_path: '/lodha/properties/lodha-world-one-tower.jpg',
        spaces_url: 'https://lodha-cms-media.s3.amazonaws.com/lodha/properties/lodha-world-one-tower.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 4234567,
        width: 1800,
        height: 3200,
        alt_text: 'Lodha World One - World\'s tallest residential tower',
        caption: 'Reaching new heights of luxury living at the world\'s tallest residential tower',
        description: 'Majestic view of Lodha World One, the world\'s tallest residential tower setting new standards in luxury',
        uploaded_by: lodhaUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        folder_id: lodhaLuxuryFolder.id,
        file_name: 'lodha-luxury-lifestyle.jpg',
        original_name: 'Lodha Luxury Lifestyle Collection.jpg',
        file_path: '/lodha/luxury-collection/lodha-luxury-lifestyle.jpg',
        spaces_url: 'https://lodha-cms-media.s3.amazonaws.com/lodha/luxury-collection/lodha-luxury-lifestyle.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 2987654,
        width: 2200,
        height: 1400,
        alt_text: 'Luxury lifestyle amenities at Lodha properties',
        caption: 'Experience the epitome of luxury living with world-class amenities',
        description: 'Showcase of premium lifestyle amenities and facilities available at Lodha luxury properties',
        uploaded_by: lodhaUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        folder_id: lodhaBannersFolder.id,
        file_name: 'lodha-home-banner.jpg',
        original_name: 'Lodha Group Home Page Banner.jpg',
        file_path: '/lodha/banners/lodha-home-banner.jpg',
        spaces_url: 'https://lodha-cms-media.s3.amazonaws.com/lodha/banners/lodha-home-banner.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 5123456,
        width: 2800,
        height: 1600,
        alt_text: 'Lodha Group - Redefining Luxury Living in India',
        caption: 'Building better lives through exceptional real estate developments',
        description: 'Hero banner representing Lodha Group\'s vision of luxury living and exceptional developments',
        uploaded_by: lodhaUsers[0].id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('media_files', mediaFiles);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('media_files', null, {});
  }
};