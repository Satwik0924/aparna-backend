'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('clients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      companyName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: 'company_name'
      },
      contactEmail: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        field: 'contact_email'
      },
      contactPhone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        field: 'contact_phone'
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      postalCode: {
        type: Sequelize.STRING(20),
        allowNull: true,
        field: 'postal_code'
      },
      apiKey: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
        field: 'api_key'
      },
      apiKeyStatus: {
        type: Sequelize.ENUM('active', 'suspended', 'expired'),
        defaultValue: 'active',
        field: 'api_key_status'
      },
      subscriptionPlan: {
        type: Sequelize.ENUM('basic', 'premium', 'enterprise'),
        defaultValue: 'basic',
        field: 'subscription_plan'
      },
      monthlyRequests: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'monthly_requests'
      },
      monthlyRequestsLimit: {
        type: Sequelize.INTEGER,
        defaultValue: 1000,
        field: 'monthly_requests_limit'
      },
      bandwidthUsage: {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        field: 'bandwidth_usage'
      },
      bandwidthLimit: {
        type: Sequelize.BIGINT,
        defaultValue: 1073741824,
        field: 'bandwidth_limit'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      subscriptionExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'subscription_expires_at'
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
    await queryInterface.addIndex('clients', ['api_key'], { unique: true });
    await queryInterface.addIndex('clients', ['contact_email'], { unique: true });
    await queryInterface.addIndex('clients', ['subscription_plan']);
    await queryInterface.addIndex('clients', ['is_active']);
    await queryInterface.addIndex('clients', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('clients');
  }
};