'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('blog_media', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
        allowNull: false,
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
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      spaces_key: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      link: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      file_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    });

    // Add indexes
    try {
      await queryInterface.addIndex('blog_media', ['client_id'], {
        name: 'blog_media_client_id_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_media', ['file_type'], {
        name: 'blog_media_file_type_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_media', ['uploaded_by'], {
        name: 'blog_media_uploaded_by_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('blog_media', ['spaces_key'], {
        name: 'blog_media_spaces_key_idx',
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }
  },

  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('blog_media');
  },
};