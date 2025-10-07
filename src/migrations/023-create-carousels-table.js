'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('carousels', {
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
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('property', 'testimonial', 'banner', 'gallery', 'custom'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      autoPlay: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'auto_play'
      },
      autoPlaySpeed: {
        type: Sequelize.INTEGER,
        defaultValue: 5000,
        field: 'auto_play_speed'
      },
      showDots: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'show_dots'
      },
      showArrows: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'show_arrows'
      },
      infiniteLoop: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'infinite_loop'
      },
      transitionEffect: {
        type: Sequelize.ENUM('fade', 'slide', 'cube', 'flip', 'coverflow'),
        defaultValue: 'slide',
        field: 'transition_effect'
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
    await queryInterface.addIndex('carousels', ['client_id']);
    await queryInterface.addIndex('carousels', ['slug', 'client_id'], { unique: true });
    await queryInterface.addIndex('carousels', ['type']);
    await queryInterface.addIndex('carousels', ['is_active']);
    await queryInterface.addIndex('carousels', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('carousels');
  }
};