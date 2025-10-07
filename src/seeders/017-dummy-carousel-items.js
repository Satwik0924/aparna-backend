'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if carousel items already exist
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM carousel_items",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing.count > 0) {
      console.log('Carousel items already exist, skipping seeding');
      return;
    }

    // Get clients, carousels, and media files
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const carousels = await queryInterface.sequelize.query(
      'SELECT id, name, client_id FROM carousels',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const mediaFiles = await queryInterface.sequelize.query(
      'SELECT id, file_name, client_id FROM media_files WHERE file_type = \'image\'',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    // Get carousels for each client
    const aparnaHeroCarousel = carousels.find(c => c.name === 'Homepage Hero Carousel' && c.client_id === aparnaClient.id);
    const aparnaPropertiesCarousel = carousels.find(c => c.name === 'Featured Properties Carousel' && c.client_id === aparnaClient.id);
    const aparnaTestimonialsCarousel = carousels.find(c => c.name === 'Testimonials Carousel' && c.client_id === aparnaClient.id);

    const prestigeHeroCarousel = carousels.find(c => c.name === 'Homepage Hero Carousel' && c.client_id === prestigeClient.id);
    const prestigePortfolioCarousel = carousels.find(c => c.name === 'Project Portfolio Carousel' && c.client_id === prestigeClient.id);
    const prestigeAwardsCarousel = carousels.find(c => c.name === 'Awards and Recognition' && c.client_id === prestigeClient.id);

    const lodhaLuxuryCarousel = carousels.find(c => c.name === 'Luxury Living Carousel' && c.client_id === lodhaClient.id);
    const lodhaProjectsCarousel = carousels.find(c => c.name === 'Iconic Projects Carousel' && c.client_id === lodhaClient.id);
    const lodhaAmenitiesCarousel = carousels.find(c => c.name === 'Lifestyle Amenities Carousel' && c.client_id === lodhaClient.id);

    // Get media files for each client
    const aparnaMediaFiles = mediaFiles.filter(m => m.client_id === aparnaClient.id);
    const prestigeMediaFiles = mediaFiles.filter(m => m.client_id === prestigeClient.id);
    const lodhaMediaFiles = mediaFiles.filter(m => m.client_id === lodhaClient.id);

    const carouselItems = [
      // Aparna Hero Carousel Items
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        carousel_id: aparnaHeroCarousel.id,
        title: 'Welcome to Aparna Constructions',
        subtitle: 'Building Dreams for Over 20 Years',
        description: 'Experience quality construction, timely delivery, and exceptional customer service with Hyderabad\'s trusted real estate developer.',
        image_id: aparnaMediaFiles.find(m => m.name === 'aparna-home-banner.jpg')?.id || null,
        link_url: '/about',
        link_text: 'Learn More About Us',
        link_target: '_self',
        background_color: '#1E40AF',
        text_color: '#FFFFFF',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        carousel_id: aparnaHeroCarousel.id,
        title: 'Aparna Sarovar Zenith',
        subtitle: 'Luxury 3 & 4 BHK Apartments',
        description: 'Discover premium living spaces with world-class amenities in the heart of Hyderabad\'s prime location.',
        image_id: aparnaMediaFiles.find(m => m.name === 'aparna-sarovar-zenith-exterior.jpg')?.id || null,
        link_url: '/properties/aparna-sarovar-zenith',
        link_text: 'Explore Property',
        link_target: '_self',
        background_color: '#059669',
        text_color: '#FFFFFF',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        carousel_id: aparnaHeroCarousel.id,
        title: 'New Year Special Offers',
        subtitle: 'Limited Time Discounts',
        description: 'Take advantage of our exclusive New Year offers on select premium properties. Contact us today!',
        image_id: null,
        link_url: '/contact',
        link_text: 'Contact Now',
        link_target: '_self',
        background_color: '#DC2626',
        text_color: '#FFFFFF',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Aparna Testimonials Carousel Items
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        carousel_id: aparnaTestimonialsCarousel.id,
        title: 'Excellent Service and Quality',
        subtitle: 'Rajesh Kumar, Sarovar Zenith Resident',
        description: '"Aparna Constructions delivered exactly what they promised. The quality of construction and attention to detail is exceptional. We are extremely happy with our new home."',
        image_id: null,
        link_url: null,
        link_text: null,
        link_target: '_self',
        background_color: '#F3F4F6',
        text_color: '#1F2937',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        carousel_id: aparnaTestimonialsCarousel.id,
        title: 'Timely Delivery and Trust',
        subtitle: 'Priya Sharma, Hillpark Meadows',
        description: '"We chose Aparna because of their reputation for timely delivery. They delivered our villa exactly on schedule with no compromises on quality. Highly recommended!"',
        image_id: null,
        link_url: null,
        link_text: null,
        link_target: '_self',
        background_color: '#F3F4F6',
        text_color: '#1F2937',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Hero Carousel Items
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        carousel_id: prestigeHeroCarousel.id,
        title: 'Prestige Group',
        subtitle: 'Three Decades of Excellence',
        description: 'South India\'s leading real estate developer with over 280 completed projects across residential, commercial, and hospitality sectors.',
        image_id: prestigeMediaFiles.find(m => m.name === 'prestige-home-banner.jpg')?.id || null,
        link_url: '/about',
        link_text: 'Our Legacy',
        link_target: '_self',
        background_color: '#7C2D12',
        text_color: '#FFFFFF',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        carousel_id: prestigeHeroCarousel.id,
        title: 'Premium Residential Projects',
        subtitle: 'Lifestyle Destinations',
        description: 'Discover premium residential developments that redefine modern living with innovative design and world-class amenities.',
        image_id: prestigeMediaFiles.find(m => m.name === 'prestige-shantiniketan-tower.jpg')?.id || null,
        link_url: '/residential',
        link_text: 'Explore Residential',
        link_target: '_self',
        background_color: '#7C3AED',
        text_color: '#FFFFFF',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        carousel_id: prestigeHeroCarousel.id,
        title: 'Investment Opportunities',
        subtitle: 'Secure Your Future',
        description: 'Explore lucrative investment opportunities with assured returns and prime locations across South India\'s major cities.',
        image_id: null,
        link_url: '/investors',
        link_text: 'Investor Relations',
        link_target: '_self',
        background_color: '#EA580C',
        text_color: '#FFFFFF',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Portfolio Carousel Items
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        carousel_id: prestigePortfolioCarousel.id,
        title: 'Residential Excellence',
        subtitle: 'Premium Homes Across Cities',
        description: 'From luxury apartments to independent villas, our residential projects offer the perfect blend of comfort and sophistication.',
        image_id: prestigeMediaFiles.find(m => m.name === 'prestige-glenwood-villas.jpg')?.id || null,
        link_url: '/residential',
        link_text: 'View Residential Projects',
        link_target: '_self',
        background_color: '#065F46',
        text_color: '#FFFFFF',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        carousel_id: prestigePortfolioCarousel.id,
        title: 'Commercial Developments',
        subtitle: 'Business Hubs of Tomorrow',
        description: 'State-of-the-art commercial spaces designed to enhance productivity and create thriving business environments.',
        image_id: null,
        link_url: '/commercial',
        link_text: 'Explore Commercial',
        link_target: '_self',
        background_color: '#1E40AF',
        text_color: '#FFFFFF',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Luxury Carousel Items
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        carousel_id: lodhaLuxuryCarousel.id,
        title: 'Redefining Luxury Living',
        subtitle: 'Where Dreams Meet Reality',
        description: 'Experience the epitome of luxury living with Lodha Group\'s iconic developments that set new standards in premium real estate.',
        image_id: lodhaMediaFiles.find(m => m.name === 'lodha-home-banner.jpg')?.id || null,
        link_url: '/luxury-homes',
        link_text: 'Explore Luxury Collection',
        link_target: '_self',
        background_color: '#0F172A',
        text_color: '#FFFFFF',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        carousel_id: lodhaLuxuryCarousel.id,
        title: 'World One',
        subtitle: 'World\'s Tallest Residential Tower',
        description: 'Reach new heights of luxury at the world\'s tallest residential tower with unparalleled views and world-class amenities.',
        image_id: lodhaMediaFiles.find(m => m.name === 'lodha-world-one-tower.jpg')?.id || null,
        link_url: '/luxury/world-one',
        link_text: 'Discover World One',
        link_target: '_self',
        background_color: '#6366F1',
        text_color: '#FFFFFF',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        carousel_id: lodhaLuxuryCarousel.id,
        title: 'Bellissimo',
        subtitle: 'Iconic Luxury in Mahalaxmi',
        description: 'Experience iconic luxury living with breathtaking Mumbai skyline views at this architectural masterpiece in Mahalaxmi.',
        image_id: lodhaMediaFiles.find(m => m.name === 'lodha-bellissimo-skyline.jpg')?.id || null,
        link_url: '/luxury/bellissimo',
        link_text: 'View Bellissimo',
        link_target: '_self',
        background_color: '#059669',
        text_color: '#FFFFFF',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Amenities Carousel Items
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        carousel_id: lodhaAmenitiesCarousel.id,
        title: 'World-Class Amenities',
        subtitle: 'Luxury Redefined',
        description: 'From infinity pools to state-of-the-art fitness centers, every amenity is designed to elevate your lifestyle.',
        image_id: lodhaMediaFiles.find(m => m.name === 'lodha-luxury-lifestyle.jpg')?.id || null,
        link_url: '/lifestyle',
        link_text: 'Explore Amenities',
        link_target: '_self',
        background_color: '#7C2D12',
        text_color: '#FFFFFF',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        carousel_id: lodhaAmenitiesCarousel.id,
        title: 'Concierge Services',
        subtitle: '24/7 Premium Support',
        description: 'Experience personalized concierge services designed to cater to your every need with the highest standards of hospitality.',
        image_id: null,
        link_url: '/luxury/concierge',
        link_text: 'Learn More',
        link_target: '_self',
        background_color: '#B91C1C',
        text_color: '#FFFFFF',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('carousel_items', carouselItems);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('carousel_items', null, {});
  }
};