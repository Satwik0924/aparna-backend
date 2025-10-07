'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add cityId column
      await queryInterface.addColumn(
        'project_carousels',
        'city_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'dropdown_values',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        { transaction }
      );

      // Add areaId column
      await queryInterface.addColumn(
        'project_carousels',
        'area_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'dropdown_values',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        { transaction }
      );

      // Add indexes for better query performance
      await queryInterface.addIndex(
        'project_carousels',
        ['city_id'],
        {
          name: 'project_carousels_city_id_idx',
          transaction
        }
      );

      await queryInterface.addIndex(
        'project_carousels',
        ['area_id'],
        {
          name: 'project_carousels_area_id_idx',
          transaction
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: any, Sequelize: any) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove indexes
      await queryInterface.removeIndex('project_carousels', 'project_carousels_area_id_idx', { transaction });
      await queryInterface.removeIndex('project_carousels', 'project_carousels_city_id_idx', { transaction });
      
      // Remove columns
      await queryInterface.removeColumn('project_carousels', 'area_id', { transaction });
      await queryInterface.removeColumn('project_carousels', 'city_id', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};