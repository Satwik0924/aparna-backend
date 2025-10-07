'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('careers_jobs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      responsibilities: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      department_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'dropdown_values',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      job_type_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'dropdown_values',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      city_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'dropdown_categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      area_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'dropdown_values',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      experience_min: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      experience_max: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      salary_min: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      salary_max: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      posted_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      closing_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('careers_jobs', ['client_id']);
    await queryInterface.addIndex('careers_jobs', ['slug']);
    await queryInterface.addIndex('careers_jobs', ['department_id']);
    await queryInterface.addIndex('careers_jobs', ['job_type_id']);
    await queryInterface.addIndex('careers_jobs', ['city_id']);
    await queryInterface.addIndex('careers_jobs', ['is_active']);
    await queryInterface.addIndex('careers_jobs', ['is_featured']);
    await queryInterface.addIndex('careers_jobs', ['posted_date']);
    await queryInterface.addIndex('careers_jobs', ['sort_order']);

    // Unique constraint for slug per client
    await queryInterface.addIndex('careers_jobs', ['client_id', 'slug'], {
      unique: true,
      name: 'careers_jobs_client_slug_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('careers_jobs');
  },
};