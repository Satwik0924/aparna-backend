'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if banners already exist
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM banners",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing.count > 0) {
      console.log('Banners already exist, skipping seeding');
      return;
    }

    // Get clients and media files
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const mediaFiles = await queryInterface.sequelize.query(
      'SELECT id, file_name, client_id FROM media_files WHERE file_type = \'image\'',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    // Get banner media files for each client
    const aparnaHomeBanner = mediaFiles.find(m => m.file_name === 'aparna-home-banner.jpg' && m.client_id === aparnaClient.id);
    const prestigeHomeBanner = mediaFiles.find(m => m.file_name === 'prestige-home-banner.jpg' && m.client_id === prestigeClient.id);
    const lodhaHomeBanner = mediaFiles.find(m => m.file_name === 'lodha-home-banner.jpg' && m.client_id === lodhaClient.id);

    const banners = [
      // Aparna Constructions Banners
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Aparna Home Hero Banner',
        type: 'hero',
        title: 'Welcome to Aparna Constructions',
        subtitle: 'Building Dreams for Over 20 Years',
        description: 'Discover luxury living with Aparna Constructions - your trusted real estate partner in Hyderabad. Experience quality construction, timely delivery, and exceptional customer service.',
        image_id: aparnaHomeBanner ? aparnaHomeBanner.id : null,
        background_color: '#1E40AF',
        text_color: '#FFFFFF',
        button_text: 'Explore Properties',
        button_url: '/properties',
        button_style: 'primary',
        position: 'center',
        animation: 'fade-in',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Aparna Sarovar Zenith Promotional Banner',
        type: 'promotional',
        title: 'Aparna Sarovar Zenith',
        subtitle: 'Luxury 3 & 4 BHK Apartments',
        description: 'Experience luxury living at Aparna Sarovar Zenith with world-class amenities, premium finishes, and stunning views in the heart of Hyderabad.',
        image_id: null,
        background_color: '#059669',
        text_color: '#FFFFFF',
        button_text: 'View Details',
        button_url: '/properties/aparna-sarovar-zenith',
        button_style: 'secondary',
        position: 'left',
        animation: 'slide-left',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Aparna New Year Offer Banner',
        type: 'promotional',
        title: 'New Year Special Offer',
        subtitle: 'Limited Time Discounts Available',
        description: 'Take advantage of our special New Year offers on select properties. Contact us today to learn more about these exclusive deals.',
        image_id: null,
        background_color: '#DC2626',
        text_color: '#FFFFFF',
        button_text: 'Contact Now',
        button_url: '/contact',
        button_style: 'primary',
        position: 'right',
        animation: 'zoom-in',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months from now
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Group Banners
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Prestige Home Hero Banner',
        type: 'hero',
        title: 'Prestige Group',
        subtitle: 'Three Decades of Excellence',
        description: 'Prestige Group - South India\'s leading real estate developer with over 280 completed projects. Discover premium residential, commercial, and hospitality developments.',
        image_id: prestigeHomeBanner ? prestigeHomeBanner.id : null,
        background_color: '#7C2D12',
        text_color: '#FFFFFF',
        button_text: 'Our Projects',
        button_url: '/projects',
        button_style: 'primary',
        position: 'center',
        animation: 'fade-in',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Prestige Shantiniketan Promotional Banner',
        type: 'promotional',
        title: 'Prestige Shantiniketan',
        subtitle: 'Premium Living in Whitefield',
        description: 'Discover premium 3 & 4 BHK apartments at Prestige Shantiniketan in Whitefield, Bangalore. Modern amenities and excellent connectivity.',
        image_id: null,
        background_color: '#7C3AED',
        text_color: '#FFFFFF',
        button_text: 'Learn More',
        button_url: '/residential/prestige-shantiniketan',
        button_style: 'secondary',
        position: 'left',
        animation: 'slide-right',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000), // 9 months from now
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Prestige Investment Banner',
        type: 'promotional',
        title: 'Investment Opportunities',
        subtitle: 'Secure Your Future Today',
        description: 'Explore lucrative investment opportunities with Prestige Group. Prime locations, assured returns, and trusted development partner.',
        image_id: null,
        background_color: '#EA580C',
        text_color: '#FFFFFF',
        button_text: 'Explore Investments',
        button_url: '/investors',
        button_style: 'primary',
        position: 'center',
        animation: 'fade-up',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Group Banners
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Lodha Home Hero Banner',
        type: 'hero',
        title: 'Lodha Group',
        subtitle: 'Redefining Luxury Living',
        description: 'Experience the pinnacle of luxury living with Lodha Group. From the world\'s tallest residential tower to premium lifestyle destinations in Mumbai.',
        image_id: lodhaHomeBanner ? lodhaHomeBanner.id : null,
        background_color: '#0F172A',
        text_color: '#FFFFFF',
        button_text: 'Luxury Collection',
        button_url: '/luxury-homes',
        button_style: 'primary',
        position: 'center',
        animation: 'fade-in',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Lodha World One Promotional Banner',
        type: 'promotional',
        title: 'Lodha World One',
        subtitle: 'World\'s Tallest Residential Tower',
        description: 'Reach new heights of luxury at Lodha World One. Unparalleled views, world-class amenities, and architectural excellence in Lower Parel.',
        image_id: null,
        background_color: '#6366F1',
        text_color: '#FFFFFF',
        button_text: 'Discover World One',
        button_url: '/luxury/world-one',
        button_style: 'secondary',
        position: 'right',
        animation: 'slide-up',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Lodha Bellissimo Promotional Banner',
        type: 'promotional',
        title: 'Lodha Bellissimo',
        subtitle: 'Iconic Luxury Residences',
        description: 'Experience iconic luxury living at Lodha Bellissimo in Mahalaxmi. Breathtaking Mumbai skyline views and world-class amenities.',
        image_id: null,
        background_color: '#059669',
        text_color: '#FFFFFF',
        button_text: 'View Bellissimo',
        button_url: '/luxury/bellissimo',
        button_style: 'primary',
        position: 'left',
        animation: 'slide-left',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Lodha Lifestyle Banner',
        type: 'custom',
        title: 'Luxury Lifestyle',
        subtitle: 'Beyond Ordinary Living',
        description: 'Discover a lifestyle that goes beyond ordinary. Premium amenities, concierge services, and luxury redefined at every Lodha development.',
        image_id: null,
        background_color: '#B91C1C',
        text_color: '#FFFFFF',
        button_text: 'Explore Lifestyle',
        button_url: '/lifestyle',
        button_style: 'secondary',
        position: 'center',
        animation: 'zoom-out',
        is_active: true,
        start_date: new Date(),
        end_date: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000), // 8 months from now
        sort_order: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('banners', banners);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('banners', null, {});
  }
};