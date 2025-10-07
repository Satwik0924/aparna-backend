'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if seo metadata already exists
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM seo_metadata",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing.count > 0) {
      console.log('SEO metadata already exists, skipping seeding');
      return;
    }

    // Get clients and properties
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const properties = await queryInterface.sequelize.query(
      'SELECT id, name, client_id FROM properties',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const contentItems = await queryInterface.sequelize.query(
      'SELECT id, title, client_id FROM content_items',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    const seoMetadata = [
      // Aparna Constructions SEO Metadata
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        entity_type: 'page',
        entity_id: null,
        page_type: 'homepage',
        url_path: '/',
        meta_title: 'Aparna Constructions - Leading Real Estate Developer in Hyderabad | Luxury Apartments & Villas',
        meta_description: 'Aparna Constructions is Hyderabad\'s trusted real estate developer with 20+ years of experience. Discover luxury apartments, villas, and premium properties with world-class amenities.',
        meta_keywords: 'aparna constructions, real estate hyderabad, luxury apartments hyderabad, villas hyderabad, property developer, residential projects, quality construction',
        canonical_url: 'https://aparnaconstructions.com/',
        og_title: 'Aparna Constructions - Building Dreams for Over 20 Years',
        og_description: 'Experience quality construction and timely delivery with Hyderabad\'s most trusted real estate developer. Explore our premium residential projects.',
        og_image: 'https://aparnaconstructions.com/images/og-home.jpg',
        og_url: 'https://aparnaconstructions.com/',
        twitter_title: 'Aparna Constructions - Luxury Real Estate in Hyderabad',
        twitter_description: 'Discover premium apartments and villas by Aparna Constructions. Quality construction, timely delivery, exceptional service.',
        twitter_image: 'https://aparnaconstructions.com/images/twitter-home.jpg',
        robots: 'index, follow',
        priority: 1.0,
        change_frequency: 'weekly',
        schema_markup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Aparna Constructions",
          "url": "https://aparnaconstructions.com",
          "logo": "https://aparnaconstructions.com/images/logo.png",
          "description": "Leading real estate developer in Hyderabad",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Hyderabad",
            "addressRegion": "Telangana",
            "addressCountry": "IN"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-40-4567-8900",
            "contactType": "Customer Service"
          }
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        entity_type: 'page',
        entity_id: null,
        page_type: 'about',
        url_path: '/about',
        meta_title: 'About Aparna Constructions - 20+ Years of Excellence in Real Estate Development',
        meta_description: 'Learn about Aparna Constructions\' journey, vision, and commitment to quality. Discover why we are Hyderabad\'s most trusted real estate developer with 20+ years of experience.',
        meta_keywords: 'about aparna constructions, company history, real estate experience, construction quality, hyderabad developer, vision mission',
        canonical_url: 'https://aparnaconstructions.com/about',
        og_title: 'About Aparna Constructions - Building Trust Since 2003',
        og_description: 'Discover our journey of excellence in real estate development. Quality, innovation, and customer satisfaction drive everything we do.',
        og_image: 'https://aparnaconstructions.com/images/og-about.jpg',
        og_url: 'https://aparnaconstructions.com/about',
        twitter_title: 'About Aparna Constructions - Excellence in Real Estate',
        twitter_description: '20+ years of building dreams in Hyderabad. Discover our commitment to quality and customer satisfaction.',
        twitter_image: 'https://aparnaconstructions.com/images/twitter-about.jpg',
        robots: 'index, follow',
        priority: 0.8,
        change_frequency: 'monthly',
        schema_markup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Aparna Constructions",
          "description": "Learn about Aparna Constructions' 20+ years of excellence in real estate development"
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        entity_type: 'property',
        entity_id: properties.find(p => p.name === 'Aparna Sarovar Zenith' && p.client_id === aparnaClient.id)?.id,
        page_type: 'property_detail',
        url_path: '/properties/aparna-sarovar-zenith',
        meta_title: 'Aparna Sarovar Zenith - Luxury 3 & 4 BHK Apartments in Nallagandla, Hyderabad',
        meta_description: 'Discover luxury living at Aparna Sarovar Zenith. Premium 3 & 4 BHK apartments with world-class amenities in Nallagandla, Hyderabad. RERA approved project.',
        meta_keywords: 'aparna sarovar zenith, luxury apartments nallagandla, 3 bhk apartments hyderabad, 4 bhk apartments, premium residential, world class amenities',
        canonical_url: 'https://aparnaconstructions.com/properties/aparna-sarovar-zenith',
        og_title: 'Aparna Sarovar Zenith - Luxury Apartments in Prime Location',
        og_description: 'Experience premium living with stunning views, world-class amenities, and modern architecture in the heart of Hyderabad.',
        og_image: 'https://aparnaconstructions.com/images/sarovar-zenith-og.jpg',
        og_url: 'https://aparnaconstructions.com/properties/aparna-sarovar-zenith',
        twitter_title: 'Aparna Sarovar Zenith - Luxury 3 & 4 BHK Apartments',
        twitter_description: 'Premium apartments with world-class amenities in Nallagandla, Hyderabad. Book your dream home today.',
        twitter_image: 'https://aparnaconstructions.com/images/sarovar-zenith-twitter.jpg',
        robots: 'index, follow',
        priority: 0.9,
        change_frequency: 'monthly',
        schema_markup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": "Aparna Sarovar Zenith",
          "description": "Luxury 3 & 4 BHK apartments with world-class amenities",
          "price": "₹85,00,000",
          "priceCurrency": "INR",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Nallagandla, Serilingampally",
            "addressLocality": "Hyderabad",
            "addressRegion": "Telangana",
            "postalCode": "500019",
            "addressCountry": "IN"
          }
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Group SEO Metadata
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        entity_type: 'page',
        entity_id: null,
        page_type: 'homepage',
        url_path: '/',
        meta_title: 'Prestige Group - South India\'s Leading Real Estate Developer | 30+ Years of Excellence',
        meta_description: 'Prestige Group is South India\'s premier real estate developer with 280+ completed projects. Discover luxury residential, commercial, and hospitality developments across major cities.',
        meta_keywords: 'prestige group, real estate developer south india, luxury properties bangalore, residential projects, commercial developments, hospitality projects',
        canonical_url: 'https://prestigegroup.info/',
        og_title: 'Prestige Group - Three Decades of Excellence in Real Estate',
        og_description: 'Discover premium lifestyle destinations by South India\'s most trusted real estate developer. 280+ projects, 45 million sq ft delivered.',
        og_image: 'https://prestigegroup.info/images/og-home.jpg',
        og_url: 'https://prestigegroup.info/',
        twitter_title: 'Prestige Group - Premium Real Estate Developments',
        twitter_description: '30+ years of creating lifestyle destinations. Explore luxury residential and commercial projects across South India.',
        twitter_image: 'https://prestigegroup.info/images/twitter-home.jpg',
        robots: 'index, follow',
        priority: 1.0,
        change_frequency: 'weekly',
        schema_markup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Prestige Group",
          "url": "https://prestigegroup.info",
          "logo": "https://prestigegroup.info/images/logo.png",
          "description": "South India's leading real estate developer",
          "foundingDate": "1986",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Bangalore",
            "addressRegion": "Karnataka",
            "addressCountry": "IN"
          }
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        entity_type: 'property',
        entity_id: properties.find(p => p.name === 'Prestige Shantiniketan' && p.client_id === prestigeClient.id)?.id,
        page_type: 'property_detail',
        url_path: '/residential/prestige-shantiniketan',
        meta_title: 'Prestige Shantiniketan - Premium 3 & 4 BHK Apartments in Whitefield, Bangalore',
        meta_description: 'Experience premium living at Prestige Shantiniketan in Whitefield, Bangalore. Luxury 3 & 4 BHK apartments with world-class amenities and excellent connectivity.',
        meta_keywords: 'prestige shantiniketan, apartments whitefield, 3 bhk bangalore, 4 bhk apartments, premium residential bangalore, luxury apartments',
        canonical_url: 'https://prestigegroup.info/residential/prestige-shantiniketan',
        og_title: 'Prestige Shantiniketan - Luxury Living in Whitefield',
        og_description: 'Discover premium apartments with modern amenities and excellent connectivity in Bangalore\'s thriving IT corridor.',
        og_image: 'https://prestigegroup.info/images/shantiniketan-og.jpg',
        og_url: 'https://prestigegroup.info/residential/prestige-shantiniketan',
        robots: 'index, follow',
        priority: 0.9,
        change_frequency: 'monthly',
        schema_markup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": "Prestige Shantiniketan",
          "description": "Premium 3 & 4 BHK apartments in Whitefield",
          "price": "₹1,20,00,000",
          "priceCurrency": "INR"
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Group SEO Metadata
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        entity_type: 'page',
        entity_id: null,
        page_type: 'homepage',
        url_path: '/',
        meta_title: 'Lodha Group - India\'s #1 Luxury Real Estate Developer | Premium Homes & Developments',
        meta_description: 'Lodha Group is India\'s premier luxury real estate developer. Discover iconic developments including World One, the world\'s tallest residential tower, and premium lifestyle destinations.',
        meta_keywords: 'lodha group, luxury real estate mumbai, premium apartments mumbai, world one tower, luxury homes, premium developments, iconic projects',
        canonical_url: 'https://lodhagroup.in/',
        og_title: 'Lodha Group - Redefining Luxury Living in India',
        og_description: 'Experience the pinnacle of luxury living with India\'s most prestigious real estate developer. Iconic developments that set new standards.',
        og_image: 'https://lodhagroup.in/images/og-home.jpg',
        og_url: 'https://lodhagroup.in/',
        twitter_title: 'Lodha Group - Luxury Real Estate Redefined',
        twitter_description: 'Discover iconic luxury developments by India\'s #1 premium real estate developer. Where dreams meet reality.',
        twitter_image: 'https://lodhagroup.in/images/twitter-home.jpg',
        robots: 'index, follow',
        priority: 1.0,
        change_frequency: 'weekly',
        schema_markup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Lodha Group",
          "url": "https://lodhagroup.in",
          "logo": "https://lodhagroup.in/images/logo.png",
          "description": "India's #1 luxury real estate developer",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Mumbai",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
          }
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        entity_type: 'property',
        entity_id: properties.find(p => p.name === 'Lodha World One' && p.client_id === lodhaClient.id)?.id,
        page_type: 'property_detail',
        url_path: '/luxury/world-one',
        meta_title: 'Lodha World One - World\'s Tallest Residential Tower | Luxury Apartments Mumbai',
        meta_description: 'Experience luxury at new heights at Lodha World One, the world\'s tallest residential tower. Premium 5 BHK apartments with unparalleled views in Lower Parel, Mumbai.',
        meta_keywords: 'lodha world one, tallest residential tower, luxury apartments mumbai, 5 bhk apartments, lower parel, premium homes, world class amenities',
        canonical_url: 'https://lodhagroup.in/luxury/world-one',
        og_title: 'Lodha World One - World\'s Tallest Residential Tower',
        og_description: 'Reach new heights of luxury living with breathtaking views and world-class amenities at this architectural marvel.',
        og_image: 'https://lodhagroup.in/images/world-one-og.jpg',
        og_url: 'https://lodhagroup.in/luxury/world-one',
        robots: 'index, follow',
        priority: 1.0,
        change_frequency: 'monthly',
        schema_markup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": "Lodha World One",
          "description": "World's tallest residential tower with luxury apartments",
          "price": "₹8,50,00,000",
          "priceCurrency": "INR",
          "floorSize": {
            "@type": "QuantitativeValue",
            "value": 5200,
            "unitCode": "SQF"
          }
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        entity_type: 'property',
        entity_id: properties.find(p => p.name === 'Lodha Bellissimo' && p.client_id === lodhaClient.id)?.id,
        page_type: 'property_detail',
        url_path: '/luxury/bellissimo',
        meta_title: 'Lodha Bellissimo - Iconic Luxury Residences in Mahalaxmi, Mumbai | Premium Apartments',
        meta_description: 'Discover iconic luxury living at Lodha Bellissimo in Mahalaxmi, Mumbai. Premium 4 BHK apartments with stunning Mumbai skyline views and world-class amenities.',
        meta_keywords: 'lodha bellissimo, luxury apartments mahalaxmi, 4 bhk apartments mumbai, premium residences, mumbai skyline views, iconic developments',
        canonical_url: 'https://lodhagroup.in/luxury/bellissimo',
        og_title: 'Lodha Bellissimo - Iconic Luxury in Mahalaxmi',
        og_description: 'Experience iconic luxury living with breathtaking Mumbai skyline views at this architectural masterpiece in Mahalaxmi.',
        og_image: 'https://lodhagroup.in/images/bellissimo-og.jpg',
        og_url: 'https://lodhagroup.in/luxury/bellissimo',
        robots: 'index, follow',
        priority: 0.9,
        change_frequency: 'monthly',
        schema_markup: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": "Lodha Bellissimo",
          "description": "Iconic luxury residences with breathtaking Mumbai skyline views",
          "price": "₹3,50,00,000",
          "priceCurrency": "INR"
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('seo_metadata', seoMetadata);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('seo_metadata', null, {});
  }
};