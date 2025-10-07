'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('faqs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'client_id',
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'category_id',
        references: {
          model: 'faq_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      propertyId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'property_id',
        references: {
          model: 'properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      answer: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_published'
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'view_count'
      },
      isHelpful: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'is_helpful'
      },
      isNotHelpful: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'is_not_helpful'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        field: 'deleted_at'
      }
    });

    // Add indexes
    await queryInterface.addIndex('faqs', ['client_id']);
    await queryInterface.addIndex('faqs', ['category_id']);
    await queryInterface.addIndex('faqs', ['property_id']);
    await queryInterface.addIndex('faqs', ['is_published']);
    await queryInterface.addIndex('faqs', ['is_active']);
    await queryInterface.addIndex('faqs', ['sort_order']);
    await queryInterface.addIndex('faqs', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('faqs');
  }
};