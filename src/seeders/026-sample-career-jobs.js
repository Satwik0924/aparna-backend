'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the first client ID
    const [clients] = await queryInterface.sequelize.query(
      'SELECT id FROM clients LIMIT 1'
    );
    
    if (!clients.length) {
      console.log('No clients found. Skipping sample career jobs seeding.');
      return;
    }
    
    const clientId = clients[0].id;
    const now = new Date();

    // Get dropdown IDs
    const [departments] = await queryInterface.sequelize.query(
      `SELECT dv.id, dv.value 
       FROM dropdown_values dv 
       INNER JOIN dropdown_categories dc ON dv.category_id = dc.id 
       WHERE dc.name = 'Department'`
    );

    const [jobTypes] = await queryInterface.sequelize.query(
      `SELECT dv.id, dv.value 
       FROM dropdown_values dv 
       INNER JOIN dropdown_categories dc ON dv.category_id = dc.id 
       WHERE dc.name = 'Job Type'`
    );

    const [cities] = await queryInterface.sequelize.query(
      `SELECT id, name FROM dropdown_categories WHERE level = 0 AND parent_id IS NULL AND name LIKE '%City%' LIMIT 1`
    );

    // Get specific IDs
    const engineeringDept = departments.find(d => d.value === 'Engineering');
    const salesDept = departments.find(d => d.value === 'Sales & Marketing');
    const hrDept = departments.find(d => d.value === 'Human Resources');
    
    const fullTime = jobTypes.find(t => t.value === 'Full Time');
    const internship = jobTypes.find(t => t.value === 'Internship');
    const contract = jobTypes.find(t => t.value === 'Contract');

    const cityId = cities.length > 0 ? cities[0].id : null;

    // Create sample jobs
    const sampleJobs = [
      {
        id: uuidv4(),
        client_id: clientId,
        title: 'Senior Software Engineer',
        slug: 'senior-software-engineer',
        description: '<p>We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining high-quality software solutions.</p>',
        requirements: JSON.stringify([
          'Bachelor\'s degree in Computer Science or related field',
          '5+ years of experience in software development',
          'Strong proficiency in JavaScript, React, and Node.js',
          'Experience with cloud platforms (AWS/Azure)',
          'Excellent problem-solving skills'
        ]),
        responsibilities: JSON.stringify([
          'Design and develop scalable web applications',
          'Lead code reviews and mentor junior developers',
          'Collaborate with cross-functional teams',
          'Implement best practices and coding standards',
          'Troubleshoot and debug applications'
        ]),
        department_id: engineeringDept?.id || null,
        job_type_id: fullTime?.id || null,
        city_id: cityId,
        experience_min: 5,
        experience_max: 8,
        salary_min: 1500000,
        salary_max: 2500000,
        is_active: true,
        is_featured: true,
        posted_date: now,
        closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        sort_order: 0,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        client_id: clientId,
        title: 'Sales Executive',
        slug: 'sales-executive',
        description: '<p>Join our sales team and help us expand our market presence. We are seeking motivated individuals with excellent communication skills.</p>',
        requirements: JSON.stringify([
          'Bachelor\'s degree in Business or related field',
          '2-4 years of sales experience',
          'Proven track record of meeting sales targets',
          'Excellent communication and negotiation skills',
          'Valid driver\'s license'
        ]),
        responsibilities: JSON.stringify([
          'Generate new leads and business opportunities',
          'Build and maintain client relationships',
          'Present products to potential customers',
          'Achieve monthly and quarterly sales targets',
          'Prepare sales reports and forecasts'
        ]),
        department_id: salesDept?.id || null,
        job_type_id: fullTime?.id || null,
        city_id: cityId,
        experience_min: 2,
        experience_max: 4,
        salary_min: 600000,
        salary_max: 1000000,
        is_active: true,
        is_featured: false,
        posted_date: now,
        sort_order: 1,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        client_id: clientId,
        title: 'HR Intern',
        slug: 'hr-intern',
        description: '<p>Great opportunity for fresh graduates to start their career in Human Resources. Learn and grow with our experienced HR team.</p>',
        requirements: JSON.stringify([
          'Currently pursuing or recently completed MBA/BBA in HR',
          'Strong interpersonal skills',
          'Proficiency in MS Office',
          'Eager to learn and grow',
          'Good written and verbal communication'
        ]),
        responsibilities: JSON.stringify([
          'Assist in recruitment and selection process',
          'Help maintain employee records',
          'Support in organizing training programs',
          'Assist in employee engagement activities',
          'Handle day-to-day HR operations'
        ]),
        department_id: hrDept?.id || null,
        job_type_id: internship?.id || null,
        city_id: cityId,
        experience_min: 0,
        experience_max: 1,
        salary_min: 15000,
        salary_max: 25000,
        is_active: true,
        is_featured: false,
        posted_date: now,
        sort_order: 2,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('careers_jobs', sampleJobs);

    console.log('✅ Sample career jobs seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('careers_jobs', {
      title: ['Senior Software Engineer', 'Sales Executive', 'HR Intern']
    });

    console.log('✅ Sample career jobs removed');
  }
};