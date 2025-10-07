'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
  await queryInterface.createTable('sell_do_logs', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    projectId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    budget: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    timeFrame: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    error: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });
  },

  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('sell_do_logs');
  }
};
