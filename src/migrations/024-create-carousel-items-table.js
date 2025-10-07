'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('carousel_items', {
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
      carouselId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'carousel_id',
        references: {
          model: 'carousels',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      subtitle: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      imageId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'image_id'
      },
      imageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'image_url'
      },
      mobileImageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'mobile_image_url'
      },
      linkUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'link_url'
      },
      linkTarget: {
        type: Sequelize.ENUM('_self', '_blank'),
        defaultValue: '_self',
        field: 'link_target'
      },
      buttonText: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'button_text'
      },
      linkText: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'link_text'
      },
      buttonColor: {
        type: Sequelize.STRING(7),
        allowNull: true,
        field: 'button_color'
      },
      backgroundColor: {
        type: Sequelize.STRING(7),
        allowNull: true,
        field: 'background_color'
      },
      textColor: {
        type: Sequelize.STRING(7),
        allowNull: true,
        field: 'text_color'
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
    await queryInterface.addIndex('carousel_items', ['client_id']);
    await queryInterface.addIndex('carousel_items', ['carousel_id']);
    await queryInterface.addIndex('carousel_items', ['sort_order']);
    await queryInterface.addIndex('carousel_items', ['is_active']);
    await queryInterface.addIndex('carousel_items', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('carousel_items');
  }
};