'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('banners', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('hero', 'promotional', 'sidebar', 'popup', 'custom'),
        allowNull: false
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
      buttonColor: {
        type: Sequelize.STRING(7),
        allowNull: true,
        field: 'button_color'
      },
      buttonUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'button_url'
      },
      buttonStyle: {
        type: Sequelize.ENUM('primary', 'secondary', 'outline', 'ghost'),
        allowNull: true,
        field: 'button_style'
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
      position: {
        type: Sequelize.ENUM('left', 'center', 'right'),
        defaultValue: 'center'
      },
      animation: {
        type: Sequelize.ENUM('fade-in', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'zoom-in', 'zoom-out', 'fade-up'),
        defaultValue: 'fade-in'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'start_date'
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'end_date'
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
      },
      impressions: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.addIndex('banners', ['client_id']);
    await queryInterface.addIndex('banners', ['type']);
    await queryInterface.addIndex('banners', ['is_active']);
    await queryInterface.addIndex('banners', ['start_date', 'end_date']);
    await queryInterface.addIndex('banners', ['sort_order']);
    await queryInterface.addIndex('banners', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('banners');
  }
};