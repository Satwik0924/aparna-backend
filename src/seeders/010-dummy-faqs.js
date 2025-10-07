'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if FAQ data already exists
    const [existingCategories] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM faq_categories",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingCategories.count > 0) {
      console.log('FAQ data already exists, skipping seeding');
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

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    // FAQ Categories
    const faqCategories = [
      // Aparna FAQ Categories
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'General Information',
        slug: 'general-information',
        description: 'General questions about Aparna Constructions',
        color: '#3B82F6',
        icon: 'information-circle',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Booking & Payment',
        slug: 'booking-payment',
        description: 'Questions about booking process and payment terms',
        color: '#10B981',
        icon: 'credit-card',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Construction & Delivery',
        slug: 'construction-delivery',
        description: 'Questions about construction progress and delivery',
        color: '#F59E0B',
        icon: 'build',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige FAQ Categories
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Project Information',
        slug: 'project-information',
        description: 'Information about Prestige Group projects',
        color: '#8B5CF6',
        icon: 'information-circle',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Legal & Documentation',
        slug: 'legal-documentation',
        description: 'Legal and documentation related questions',
        color: '#EF4444',
        icon: 'document-text',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha FAQ Categories
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Luxury Features',
        slug: 'luxury-features',
        description: 'Questions about luxury amenities and features',
        color: '#059669',
        icon: 'star',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('faq_categories', faqCategories);

    // Get the inserted FAQ categories
    const insertedCategories = await queryInterface.sequelize.query(
      'SELECT id, name, client_id FROM faq_categories',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaGeneralCategory = insertedCategories.find(c => c.name === 'General Information' && c.client_id === aparnaClient.id);
    const aparnaBookingCategory = insertedCategories.find(c => c.name === 'Booking & Payment' && c.client_id === aparnaClient.id);
    const aparnaConstructionCategory = insertedCategories.find(c => c.name === 'Construction & Delivery' && c.client_id === aparnaClient.id);

    const prestigeProjectCategory = insertedCategories.find(c => c.name === 'Project Information' && c.client_id === prestigeClient.id);
    const prestigeLegalCategory = insertedCategories.find(c => c.name === 'Legal & Documentation' && c.client_id === prestigeClient.id);

    const lodhaLuxuryCategory = insertedCategories.find(c => c.name === 'Luxury Features' && c.client_id === lodhaClient.id);

    // FAQs
    const faqs = [
      // Aparna FAQs
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        category_id: aparnaGeneralCategory.id,
        property_id: null,
        question: 'What is the experience of Aparna Constructions in real estate development?',
        answer: 'Aparna Constructions has over 20 years of experience in real estate development. We have successfully completed numerous residential and commercial projects across Hyderabad, establishing ourselves as a trusted name in the industry.',
        is_published: true,
        sort_order: 1,
        view_count: 245,
        is_helpful: 32,
        is_not_helpful: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        category_id: aparnaGeneralCategory.id,
        property_id: null,
        question: 'What are the key differentiators of Aparna Constructions?',
        answer: 'Our key differentiators include superior quality construction, timely delivery, innovative designs, customer-centric approach, and comprehensive after-sales service. We focus on creating sustainable and environmentally friendly developments.',
        is_published: true,
        sort_order: 2,
        view_count: 189,
        is_helpful: 28,
        is_not_helpful: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        category_id: aparnaBookingCategory.id,
        property_id: null,
        question: 'What is the booking process for Aparna properties?',
        answer: 'The booking process involves: 1) Property selection and site visit, 2) Initial booking amount payment, 3) Documentation and agreement signing, 4) Payment schedule as per agreement, 5) Regular construction updates, 6) Final handover upon completion.',
        is_published: true,
        sort_order: 1,
        view_count: 456,
        is_helpful: 67,
        is_not_helpful: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        category_id: aparnaBookingCategory.id,
        property_id: null,
        question: 'What are the payment options available?',
        answer: 'We offer flexible payment options including: Construction-linked payment plans, Down payment plans, Bank loan assistance, and Special schemes for early bookers. Our team will help you choose the best payment option based on your financial convenience.',
        is_published: true,
        sort_order: 2,
        view_count: 389,
        is_helpful: 45,
        is_not_helpful: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Property-specific FAQ for Aparna Sarovar Zenith
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        category_id: aparnaConstructionCategory.id,
        property_id: properties.find(p => p.name === 'Aparna Sarovar Zenith').id,
        question: 'What is the current construction status of Aparna Sarovar Zenith?',
        answer: 'Aparna Sarovar Zenith is currently 85% complete. The structural work is finished, and we are in the final stages of internal fittings and landscaping. The project is on track for delivery by Q2 2024.',
        is_published: true,
        sort_order: 1,
        view_count: 567,
        is_helpful: 78,
        is_not_helpful: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        category_id: aparnaGeneralCategory.id,
        property_id: properties.find(p => p.name === 'Aparna Sarovar Zenith').id,
        question: 'What amenities are available at Aparna Sarovar Zenith?',
        answer: 'Aparna Sarovar Zenith offers world-class amenities including a swimming pool, fully equipped gymnasium, clubhouse, children\'s play area, landscaped gardens, 24/7 security, and covered parking. The project also features a business center and guest accommodation.',
        is_published: true,
        sort_order: 2,
        view_count: 432,
        is_helpful: 56,
        is_not_helpful: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige FAQs
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        category_id: prestigeProjectCategory.id,
        property_id: null,
        question: 'What makes Prestige Group projects unique?',
        answer: 'Prestige Group projects are known for their architectural excellence, premium locations, world-class amenities, and superior construction quality. We focus on creating lifestyle destinations that offer the perfect blend of luxury and functionality.',
        is_published: true,
        sort_order: 1,
        view_count: 321,
        is_helpful: 42,
        is_not_helpful: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        category_id: prestigeLegalCategory.id,
        property_id: null,
        question: 'What legal documents are provided with Prestige properties?',
        answer: 'We provide comprehensive legal documentation including Sale Agreement, Allotment Letter, Construction Agreement, RERA Registration Certificate, Approved Plans, NOC from relevant authorities, and Title Deed upon completion.',
        is_published: true,
        sort_order: 1,
        view_count: 278,
        is_helpful: 38,
        is_not_helpful: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha FAQs
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        category_id: lodhaLuxuryCategory.id,
        property_id: null,
        question: 'What luxury amenities are standard in Lodha properties?',
        answer: 'Lodha properties feature premium amenities including infinity pools, state-of-the-art fitness centers, spa and wellness facilities, concierge services, valet parking, private dining areas, business centers, and exclusive club facilities.',
        is_published: true,
        sort_order: 1,
        view_count: 543,
        is_helpful: 72,
        is_not_helpful: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        category_id: lodhaLuxuryCategory.id,
        property_id: properties.find(p => p.name === 'Lodha World One').id,
        question: 'What makes Lodha World One special?',
        answer: 'Lodha World One is the world\'s tallest residential tower, offering unparalleled luxury living with breathtaking views of Mumbai. It features sky gardens, premium club facilities, temperature-controlled swimming pools, and 24/7 concierge services.',
        is_published: true,
        sort_order: 2,
        view_count: 789,
        is_helpful: 95,
        is_not_helpful: 7,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('faqs', faqs);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('faqs', null, {});
    await queryInterface.bulkDelete('faq_categories', null, {});
  }
};