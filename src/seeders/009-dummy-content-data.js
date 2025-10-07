'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if content data already exists
    const [existingCategories] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM content_categories",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingCategories.count > 0) {
      console.log('Content data already exists, skipping seeding');
      return;
    }

    // Get clients, content types, and users
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const contentTypes = await queryInterface.sequelize.query(
      'SELECT id, name FROM content_types',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      'SELECT id, first_name, last_name, client_id FROM users WHERE client_id IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const pageType = contentTypes.find(ct => ct.name === 'page');
    const blogType = contentTypes.find(ct => ct.name === 'blog_post');
    const landingPageType = contentTypes.find(ct => ct.name === 'landing_page');

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    const aparnaUsers = users.filter(u => u.client_id === aparnaClient.id);
    const prestigeUsers = users.filter(u => u.client_id === prestigeClient.id);
    const lodhaUsers = users.filter(u => u.client_id === lodhaClient.id);

    // Content Categories
    const contentCategories = [
      // Aparna Categories
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Company News',
        slug: 'company-news',
        description: 'Latest news and updates from Aparna Constructions',
        color: '#3B82F6',
        icon: 'newspaper',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Property Insights',
        slug: 'property-insights',
        description: 'Expert insights on real estate and property market',
        color: '#10B981',
        icon: 'chart-bar',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Lifestyle',
        slug: 'lifestyle',
        description: 'Lifestyle and home living tips',
        color: '#F59E0B',
        icon: 'home',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Categories
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Project Updates',
        slug: 'project-updates',
        description: 'Latest updates on ongoing projects',
        color: '#8B5CF6',
        icon: 'clipboard-check',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Investment Guide',
        slug: 'investment-guide',
        description: 'Real estate investment guidance and tips',
        color: '#EF4444',
        icon: 'currency-dollar',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Categories
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Luxury Living',
        slug: 'luxury-living',
        description: 'Insights into luxury living and premium lifestyle',
        color: '#059669',
        icon: 'star',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('content_categories', contentCategories);

    // Content Tags
    const contentTags = [
      // Aparna Tags
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Hyderabad',
        slug: 'hyderabad',
        color: '#3B82F6',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Luxury Apartments',
        slug: 'luxury-apartments',
        color: '#10B981',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Investment',
        slug: 'investment',
        color: '#F59E0B',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Tags
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Bangalore',
        slug: 'bangalore',
        color: '#8B5CF6',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Premium Homes',
        slug: 'premium-homes',
        color: '#EF4444',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Tags
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Mumbai',
        slug: 'mumbai',
        color: '#059669',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Luxury',
        slug: 'luxury',
        color: '#DC2626',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('content_tags', contentTags);

    // Content Items
    const contentItems = [
      // Aparna Content
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        type_id: pageType.id,
        title: 'About Aparna Constructions',
        slug: 'about-us',
        content: '<h1>About Aparna Constructions</h1><p>Aparna Constructions is a leading real estate developer in Hyderabad, dedicated to creating exceptional living spaces that blend luxury, comfort, and innovation. With over two decades of experience in the industry, we have established ourselves as a trusted name in residential and commercial construction.</p><h2>Our Vision</h2><p>To be the most preferred real estate developer in South India, known for quality, innovation, and customer satisfaction.</p><h2>Our Mission</h2><p>To create sustainable, innovative, and quality living spaces that enhance the lifestyle of our customers while contributing to the growth of the communities we serve.</p>',
        excerpt: 'Aparna Constructions is a leading real estate developer in Hyderabad, dedicated to creating exceptional living spaces.',
        status: 'published',
        seo_title: 'About Aparna Constructions - Leading Real Estate Developer in Hyderabad',
        seo_description: 'Learn about Aparna Constructions, a leading real estate developer in Hyderabad with over two decades of experience in creating exceptional living spaces.',
        seo_keywords: 'aparna constructions, real estate developer hyderabad, luxury apartments, quality construction',
        author_id: aparnaUsers[0].id,
        published_at: new Date(),
        view_count: 1456,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        type_id: blogType.id,
        title: 'Top 10 Reasons to Invest in Hyderabad Real Estate',
        slug: 'top-10-reasons-invest-hyderabad-real-estate',
        content: '<h1>Top 10 Reasons to Invest in Hyderabad Real Estate</h1><p>Hyderabad has emerged as one of India\'s most promising real estate markets. Here are the top 10 reasons why you should consider investing in Hyderabad real estate:</p><h2>1. IT Hub Growth</h2><p>Hyderabad is home to major IT companies like Microsoft, Google, and Amazon, driving demand for residential properties.</p><h2>2. Infrastructure Development</h2><p>The city\'s infrastructure is rapidly developing with new metro lines, airports, and road networks.</p><h2>3. Affordable Property Prices</h2><p>Compared to Mumbai and Bangalore, Hyderabad offers more affordable property prices with better value for money.</p>',
        excerpt: 'Discover the top 10 reasons why Hyderabad is becoming one of India\'s most attractive real estate investment destinations.',
        status: 'published',
        seo_title: 'Top 10 Reasons to Invest in Hyderabad Real Estate - Investment Guide',
        seo_description: 'Explore the top reasons to invest in Hyderabad real estate market. Learn about growth opportunities and investment potential.',
        seo_keywords: 'hyderabad real estate investment, property investment hyderabad, real estate market trends',
        author_id: aparnaUsers[1].id,
        published_at: new Date(),
        view_count: 2345,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Content
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        type_id: pageType.id,
        title: 'About Prestige Group',
        slug: 'about-prestige-group',
        content: '<h1>About Prestige Group</h1><p>Prestige Group is one of South India\'s leading real estate developers, with a legacy spanning over three decades. Founded in 1986, we have consistently delivered exceptional residential, commercial, retail, and hospitality projects across Bangalore, Chennai, Hyderabad, Kochi, and Goa.</p><h2>Our Legacy</h2><p>Over 280 projects completed, 45 million sq ft delivered, and 50,000+ happy customers.</p><h2>Our Values</h2><p>Quality, Integrity, Innovation, and Customer Focus drive everything we do.</p>',
        excerpt: 'Prestige Group is one of South India\'s leading real estate developers with over three decades of experience.',
        status: 'published',
        seo_title: 'About Prestige Group - Leading Real Estate Developer in South India',
        seo_description: 'Learn about Prestige Group, a leading real estate developer in South India with over 30 years of experience and 280+ completed projects.',
        seo_keywords: 'prestige group, real estate developer south india, bangalore properties, luxury projects',
        author_id: prestigeUsers[0].id,
        published_at: new Date(),
        view_count: 987,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Content
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        type_id: blogType.id,
        title: 'The Future of Luxury Living in Mumbai',
        slug: 'future-luxury-living-mumbai',
        content: '<h1>The Future of Luxury Living in Mumbai</h1><p>Mumbai\'s luxury real estate market is experiencing unprecedented growth, driven by changing lifestyle preferences and increased demand for premium amenities. At Lodha Group, we\'re at the forefront of this transformation.</p><h2>Trends Shaping Luxury Living</h2><p>Smart homes, sustainable living, and wellness-focused amenities are becoming essential features in luxury developments.</p><h2>Prime Locations</h2><p>Areas like Lower Parel, Mahalaxmi, and Worli are emerging as preferred destinations for luxury homebuyers.</p>',
        excerpt: 'Explore the future trends and opportunities in Mumbai\'s luxury real estate market.',
        status: 'published',
        seo_title: 'The Future of Luxury Living in Mumbai - Real Estate Trends',
        seo_description: 'Discover the latest trends shaping luxury living in Mumbai. Learn about premium developments and future opportunities.',
        seo_keywords: 'luxury living mumbai, premium real estate mumbai, mumbai property trends, luxury apartments',
        author_id: lodhaUsers[0].id,
        published_at: new Date(),
        view_count: 1876,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('content_items', contentItems);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('content_items', null, {});
    await queryInterface.bulkDelete('content_tags', null, {});
    await queryInterface.bulkDelete('content_categories', null, {});
  }
};