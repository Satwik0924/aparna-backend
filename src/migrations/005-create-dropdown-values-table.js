'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dropdown_values', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'category_id',
        references: {
          model: 'dropdown_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'client_id',
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      value: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
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
    await queryInterface.addIndex('dropdown_values', ['category_id']);
    await queryInterface.addIndex('dropdown_values', ['client_id']);
    await queryInterface.addIndex('dropdown_values', ['slug', 'category_id', 'client_id'], { unique: true });
    await queryInterface.addIndex('dropdown_values', ['is_active']);
    await queryInterface.addIndex('dropdown_values', ['sort_order']);
    await queryInterface.addIndex('dropdown_values', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('dropdown_values');
  }
};