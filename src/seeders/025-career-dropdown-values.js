'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the first client ID
    const [clients] = await queryInterface.sequelize.query(
      'SELECT id FROM clients LIMIT 1'
    );
    
    if (!clients.length) {
      console.log('No clients found. Skipping career dropdown values seeding.');
      return;
    }
    
    const clientId = clients[0].id;
    const now = new Date();

    // Create dropdown categories for Department and Job Type
    const departmentCategoryId = uuidv4();
    const jobTypeCategoryId = uuidv4();

    await queryInterface.bulkInsert('dropdown_categories', [
      {
        id: departmentCategoryId,
        name: 'department',
        description: 'Job departments for career postings',
        parent_id: null,
        level: 0,
        sort_order: 0,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: jobTypeCategoryId,
        name: 'job_type',
        description: 'Employment types for career postings',
        parent_id: null,
        level: 0,
        sort_order: 1,
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ]);

    // Insert department values
    const departmentValues = [
      { id: uuidv4(), value: 'Engineering', slug: 'engineering', color: '#0066CC' },
      { id: uuidv4(), value: 'Sales & Marketing', slug: 'sales-marketing', color: '#00AA44' },
      { id: uuidv4(), value: 'Human Resources', slug: 'human-resources', color: '#FF6600' },
      { id: uuidv4(), value: 'Finance & Accounting', slug: 'finance-accounting', color: '#9933CC' },
      { id: uuidv4(), value: 'Customer Service', slug: 'customer-service', color: '#FF3366' },
      { id: uuidv4(), value: 'Operations', slug: 'operations', color: '#3366CC' },
      { id: uuidv4(), value: 'Design & Architecture', slug: 'design-architecture', color: '#CC0099' },
      { id: uuidv4(), value: 'Legal', slug: 'legal', color: '#666666' },
      { id: uuidv4(), value: 'Administration', slug: 'administration', color: '#996633' }
    ].map(dept => ({
      ...dept,
      category_id: departmentCategoryId,
      client_id: clientId,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('dropdown_values', departmentValues);

    // Insert job type values
    const jobTypeValues = [
      { id: uuidv4(), value: 'Full Time', slug: 'full-time', color: '#0066CC' },
      { id: uuidv4(), value: 'Part Time', slug: 'part-time', color: '#00AA44' },
      { id: uuidv4(), value: 'Contract', slug: 'contract', color: '#FF6600' },
      { id: uuidv4(), value: 'Freelance', slug: 'freelance', color: '#9933CC' },
      { id: uuidv4(), value: 'Internship', slug: 'internship', color: '#FF3366' },
      { id: uuidv4(), value: 'Temporary', slug: 'temporary', color: '#3366CC' }
    ].map(type => ({
      ...type,
      category_id: jobTypeCategoryId,
      client_id: clientId,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('dropdown_values', jobTypeValues);

    console.log('✅ Career dropdown values seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Delete dropdown values by category names
    await queryInterface.sequelize.query(`
      DELETE dv FROM dropdown_values dv
      INNER JOIN dropdown_categories dc ON dv.category_id = dc.id
      WHERE dc.name IN ('department', 'job_type')
    `);

    // Delete the categories
    await queryInterface.bulkDelete('dropdown_categories', {
      name: ['department', 'job_type']
    });

    console.log('✅ Career dropdown values removed');
  }
};