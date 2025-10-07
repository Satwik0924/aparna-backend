'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('menu_items', {
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
      menuId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'menu_id',
        references: {
          model: 'menus',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parentId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'parent_id',
        references: {
          model: 'menu_items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      linkType: {
        type: Sequelize.ENUM('internal', 'external', 'property', 'category', 'custom'),
        allowNull: false,
        field: 'link_type'
      },
      targetBlank: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'target_blank'
      },
      cssClasses: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'css_classes'
      },
      iconClass: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'icon_class'
      },
      description: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('menu_items', ['client_id']);
    await queryInterface.addIndex('menu_items', ['menu_id']);
    await queryInterface.addIndex('menu_items', ['parent_id']);
    await queryInterface.addIndex('menu_items', ['menu_id', 'parent_id']);
    await queryInterface.addIndex('menu_items', ['sort_order']);
    await queryInterface.addIndex('menu_items', ['is_active']);
    await queryInterface.addIndex('menu_items', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('menu_items');
  }
};