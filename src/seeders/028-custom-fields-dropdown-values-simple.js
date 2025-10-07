'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Get the first client ID
      const [clients] = await queryInterface.sequelize.query(
        'SELECT id FROM clients LIMIT 1',
        { transaction }
      );
      
      if (!clients.length) {
        console.log('No clients found. Skipping custom fields dropdown values seeding.');
        await transaction.commit();
        return;
      }
      
      const clientId = clients[0].id;
      const now = new Date();

      // Check if custom_fields category already exists
      const [existingCategories] = await queryInterface.sequelize.query(
        `SELECT id FROM dropdown_categories WHERE name = 'custom_fields'`,
        { transaction }
      );

      let customFieldsCategoryId;
      
      if (existingCategories.length === 0) {
        // Create dropdown category for custom fields (without description to avoid schema issues)
        customFieldsCategoryId = uuidv4();

        await queryInterface.bulkInsert('dropdown_categories', [
          {
            id: customFieldsCategoryId,
            name: 'custom_fields',
            parent_id: null,
            level: 0,
            sort_order: 20,
            is_active: true,
            created_at: now,
            updated_at: now
          }
        ], { transaction });
        
        console.log('✅ Custom fields category created');
      } else {
        customFieldsCategoryId = existingCategories[0].id;
        console.log('✅ Custom fields category already exists');
      }

      // Check if values already exist
      const [existingValues] = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM dropdown_values dv 
         JOIN dropdown_categories dc ON dv.category_id = dc.id 
         WHERE dc.name = 'custom_fields'`,
        { transaction }
      );

      if (existingValues[0].count > 0) {
        console.log('✅ Custom field values already exist, skipping');
        await transaction.commit();
        return;
      }

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
          value: 'RERA Number',
          slug: 'rera-number',
          sort_order: 5,
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
          sort_order: 6,
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
          sort_order: 7,
          is_active: true,
          category_id: customFieldsCategoryId,
          client_id: clientId,
          created_at: now,
          updated_at: now
        }
      ];

      await queryInterface.bulkInsert('dropdown_values', customFieldValues, { transaction });

      await transaction.commit();
      console.log('✅ Custom fields dropdown values seeded successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error seeding custom fields:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Delete dropdown values by category name
      await queryInterface.sequelize.query(`
        DELETE dv FROM dropdown_values dv
        INNER JOIN dropdown_categories dc ON dv.category_id = dc.id
        WHERE dc.name = 'custom_fields'
      `, { transaction });

      // Delete the category
      await queryInterface.sequelize.query(`
        DELETE FROM dropdown_categories WHERE name = 'custom_fields'
      `, { transaction });

      await transaction.commit();
      console.log('✅ Custom fields dropdown values removed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing custom fields:', error);
      throw error;
    }
  }
};