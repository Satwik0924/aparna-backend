import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/database';
import BlogPost from './BlogPost';
import BlogCategory from './BlogCategory';

// Define the attributes interface
interface BlogPostCategoryAttributes {
  postId: number;
  categoryId: number;
}

// Define the model class
class BlogPostCategory extends Model<BlogPostCategoryAttributes> implements BlogPostCategoryAttributes {
  public postId!: number;
  public categoryId!: number;

  // Association methods (will be added by Sequelize)
  public getPost!: () => Promise<BlogPost>;
  public setPost!: (post: BlogPost) => Promise<void>;
  public getCategory!: () => Promise<BlogCategory>;
  public setCategory!: (category: BlogCategory) => Promise<void>;
}

// Initialize the model
BlogPostCategory.init(
  {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'post_id',
      references: {
        model: BlogPost,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'category_id',
      references: {
        model: BlogCategory,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'BlogPostCategory',
    tableName: 'blog_post_categories',
    timestamps: false, // Junction tables typically don't need timestamps
    underscored: true,
    indexes: [
      {
        fields: ['post_id'], // Query all categories for a post
      },
      {
        fields: ['category_id'], // Query all posts in a category
      },
    ],
  }
);

export default BlogPostCategory;