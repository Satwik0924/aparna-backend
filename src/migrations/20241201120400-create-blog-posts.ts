'use strict';

module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable("blog_posts", {
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
          model: "clients",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
        allowNull: false,
      },
      is_indexable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      author_id: {
        type: Sequelize.UUID, // ✅ Changed from INTEGER to UUID
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      featured_image_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "blog_media",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
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
      await queryInterface.addIndex("blog_posts", ["client_id", "slug"], {
        unique: true,
        name: "blog_posts_client_slug_unique",
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex("blog_posts", ["client_id", "status"], {
        name: "blog_posts_client_status_idx",
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex("blog_posts", ["author_id"], {
        name: "blog_posts_author_id_idx",
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex("blog_posts", ["published_at"], {
        name: "blog_posts_published_at_idx",
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex("blog_posts", ["status", "published_at"], {
        name: "blog_posts_status_published_idx",
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex("blog_posts", ["featured_image_id"], {
        name: "blog_posts_featured_image_idx",
      });
    } catch (error: any) {
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }
  },

  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable("blog_posts");
  },
};
