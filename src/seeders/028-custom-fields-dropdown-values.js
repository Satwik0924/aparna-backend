'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the first client ID
    const [clients] = await queryInterface.sequelize.query(
      'SELECT id FROM clients LIMIT 1'
    );
    
    if (!clients.length) {
      console.log('No clients found. Skipping custom fields dropdown values seeding.');
      return;
    }
    
    const clientId = clients[0].id;
    const now = new Date();

    // Create dropdown category for custom fields
    const customFieldsCategoryId = uuidv4();

    await queryInterface.bulkInsert('dropdown_categories', [
      {
        id: customFieldsCategoryId,
        name: 'custom_fields',
        description: 'Custom field types for properties',
        parent_id: null,
        level: 0,
        sort_order: 20, // Put it after other categories
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ]);

    // Insert custom field type values
    const customFieldValues = [
      {
        id: uuidv4(),
        value: '3D Preview Link',
        slug: '3d-preview-link',
        sort_order: 1,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        value: 'Virtual Tour URL',
        slug: 'virtual-tour-url',
        sort_order: 2,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        value: 'Brochure Link',
        slug: 'brochure-link',
        sort_order: 3,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        value: 'Video URL',
        slug: 'video-url',
        sort_order: 4,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        value: 'Floor Plan PDF',
        slug: 'floor-plan-pdf',
        sort_order: 5,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        value: 'RERA Number',
        slug: 'rera-number',
        sort_order: 6,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        value: 'Approval Status',
        slug: 'approval-status',
        sort_order: 7,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        value: 'Contact Person',
        slug: 'contact-person',
        sort_order: 8,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        value: 'Project Website',
        slug: 'project-website',
        sort_order: 9,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        value: 'Social Media Link',
        slug: 'social-media-link',
        sort_order: 10,
        is_active: true,
        category_id: customFieldsCategoryId,
        client_id: clientId,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('dropdown_values', customFieldValues);

    console.log('✅ Custom fields dropdown values seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Delete dropdown values by category name
    await queryInterface.sequelize.query(`
      DELETE dv FROM dropdown_values dv
      INNER JOIN dropdown_categories dc ON dv.category_id = dc.id
      WHERE dc.name = 'custom_fields'
    `);

    // Delete the category
    await queryInterface.sequelize.query(`
      DELETE FROM dropdown_categories WHERE name = 'custom_fields'
    `);

    console.log('✅ Custom fields dropdown values removed successfully');
  }
};