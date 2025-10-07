'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if content mappings already exist
    const [existingCategoryMappings] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM content_category_mappings",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const [existingTagMappings] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM content_tag_mappings", 
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingCategoryMappings.count > 0 || existingTagMappings.count > 0) {
      console.log('Content mappings already exist, skipping seeding');
      return;
    }

    // Get clients, content items, categories, and tags
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const contentItems = await queryInterface.sequelize.query(
      'SELECT id, title, client_id FROM content_items',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const contentCategories = await queryInterface.sequelize.query(
      'SELECT id, name, client_id FROM content_categories',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const contentTags = await queryInterface.sequelize.query(
      'SELECT id, name, client_id FROM content_tags',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    // Get content items for each client
    const aparnaContentItems = contentItems.filter(ci => ci.client_id === aparnaClient.id);
    const prestigeContentItems = contentItems.filter(ci => ci.client_id === prestigeClient.id);
    const lodhaContentItems = contentItems.filter(ci => ci.client_id === lodhaClient.id);

    // Get categories for each client
    const aparnaCategories = contentCategories.filter(cc => cc.client_id === aparnaClient.id);
    const prestigeCategories = contentCategories.filter(cc => cc.client_id === prestigeClient.id);
    const lodhaCategories = contentCategories.filter(cc => cc.client_id === lodhaClient.id);

    // Get tags for each client
    const aparnaTags = contentTags.filter(ct => ct.client_id === aparnaClient.id);
    const prestigeTags = contentTags.filter(ct => ct.client_id === prestigeClient.id);
    const lodhaTags = contentTags.filter(ct => ct.client_id === lodhaClient.id);

    const contentMappings = [
      // Aparna Content-Category Mappings
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        content_item_id: aparnaContentItems.find(ci => ci.title === 'About Aparna Constructions')?.id,
        category_id: aparnaCategories.find(cc => cc.name === 'Company News')?.id,
        tag_id: null,
        mapping_type: 'category',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        content_item_id: aparnaContentItems.find(ci => ci.title === 'Top 10 Reasons to Invest in Hyderabad Real Estate')?.id,
        category_id: aparnaCategories.find(cc => cc.name === 'Property Insights')?.id,
        tag_id: null,
        mapping_type: 'category',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Aparna Content-Tag Mappings
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        content_item_id: aparnaContentItems.find(ci => ci.title === 'About Aparna Constructions')?.id,
        category_id: null,
        tag_id: aparnaTags.find(ct => ct.name === 'Hyderabad')?.id,
        mapping_type: 'tag',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        content_item_id: aparnaContentItems.find(ci => ci.title === 'Top 10 Reasons to Invest in Hyderabad Real Estate')?.id,
        category_id: null,
        tag_id: aparnaTags.find(ct => ct.name === 'Investment')?.id,
        mapping_type: 'tag',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        content_item_id: aparnaContentItems.find(ci => ci.title === 'Top 10 Reasons to Invest in Hyderabad Real Estate')?.id,
        category_id: null,
        tag_id: aparnaTags.find(ct => ct.name === 'Hyderabad')?.id,
        mapping_type: 'tag',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        content_item_id: aparnaContentItems.find(ci => ci.title === 'Top 10 Reasons to Invest in Hyderabad Real Estate')?.id,
        category_id: null,
        tag_id: aparnaTags.find(ct => ct.name === 'Luxury Apartments')?.id,
        mapping_type: 'tag',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Content-Category Mappings
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        content_item_id: prestigeContentItems.find(ci => ci.title === 'About Prestige Group')?.id,
        category_id: prestigeCategories.find(cc => cc.name === 'Project Updates')?.id,
        tag_id: null,
        mapping_type: 'category',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Content-Tag Mappings
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        content_item_id: prestigeContentItems.find(ci => ci.title === 'About Prestige Group')?.id,
        category_id: null,
        tag_id: prestigeTags.find(ct => ct.name === 'Bangalore')?.id,
        mapping_type: 'tag',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        content_item_id: prestigeContentItems.find(ci => ci.title === 'About Prestige Group')?.id,
        category_id: null,
        tag_id: prestigeTags.find(ct => ct.name === 'Premium Homes')?.id,
        mapping_type: 'tag',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Content-Category Mappings
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        content_item_id: lodhaContentItems.find(ci => ci.title === 'The Future of Luxury Living in Mumbai')?.id,
        category_id: lodhaCategories.find(cc => cc.name === 'Luxury Living')?.id,
        tag_id: null,
        mapping_type: 'category',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Content-Tag Mappings
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        content_item_id: lodhaContentItems.find(ci => ci.title === 'The Future of Luxury Living in Mumbai')?.id,
        category_id: null,
        tag_id: lodhaTags.find(ct => ct.name === 'Mumbai')?.id,
        mapping_type: 'tag',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        content_item_id: lodhaContentItems.find(ci => ci.title === 'The Future of Luxury Living in Mumbai')?.id,
        category_id: null,
        tag_id: lodhaTags.find(ct => ct.name === 'Luxury')?.id,
        mapping_type: 'tag',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Filter out any mappings with null IDs (in case content items, categories, or tags don't exist)
    const validMappings = contentMappings.filter(mapping => 
      mapping.content_item_id && 
      (mapping.category_id || mapping.tag_id)
    );

    // Separate category and tag mappings and transform to correct schema
    const categoryMappings = validMappings
      .filter(m => m.mapping_type === 'category')
      .map(m => ({
        id: m.id,
        content_id: m.content_item_id,
        category_id: m.category_id,
        created_at: m.created_at,
        updated_at: m.updated_at
      }));

    const tagMappings = validMappings
      .filter(m => m.mapping_type === 'tag')
      .map(m => ({
        id: m.id,
        content_id: m.content_item_id,
        tag_id: m.tag_id,
        created_at: m.created_at,
        updated_at: m.updated_at
      }));

    if (categoryMappings.length > 0) {
      await queryInterface.bulkInsert('content_category_mappings', categoryMappings);
    }

    if (tagMappings.length > 0) {
      await queryInterface.bulkInsert('content_tag_mappings', tagMappings);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('content_category_mappings', null, {});
    await queryInterface.bulkDelete('content_tag_mappings', null, {});
  }
};