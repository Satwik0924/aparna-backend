'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if content types already exist
    const existingContentTypes = await queryInterface.sequelize.query(
      "SELECT name FROM content_types WHERE name IN ('page', 'blog_post', 'landing_page')",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingContentTypes.length > 0) {
      console.log('Content types already exist, skipping seeding');
      return;
    }

    const contentTypes = [
      {
        id: uuidv4(),
        name: 'page',
        display_name: 'Page',
        fields_schema: JSON.stringify({
          title: { type: 'string', required: true },
          content: { type: 'richtext', required: true },
          excerpt: { type: 'text', required: false },
          featured_image: { type: 'media', required: false },
          seo_title: { type: 'string', required: false },
          seo_description: { type: 'text', required: false },
          seo_keywords: { type: 'string', required: false }
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'blog_post',
        display_name: 'Blog Post',
        fields_schema: JSON.stringify({
          title: { type: 'string', required: true },
          content: { type: 'richtext', required: true },
          excerpt: { type: 'text', required: false },
          featured_image: { type: 'media', required: false },
          categories: { type: 'array', required: false },
          tags: { type: 'array', required: false },
          author: { type: 'user', required: true },
          published_at: { type: 'datetime', required: false },
          seo_title: { type: 'string', required: false },
          seo_description: { type: 'text', required: false },
          seo_keywords: { type: 'string', required: false }
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'landing_page',
        display_name: 'Landing Page',
        fields_schema: JSON.stringify({
          title: { type: 'string', required: true },
          content: { type: 'richtext', required: true },
          hero_image: { type: 'media', required: false },
          cta_text: { type: 'string', required: false },
          cta_link: { type: 'string', required: false },
          conversion_tracking: { type: 'string', required: false },
          seo_title: { type: 'string', required: false },
          seo_description: { type: 'text', required: false },
          seo_keywords: { type: 'string', required: false }
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('content_types', contentTypes);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('content_types', null, {});
  }
};