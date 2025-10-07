import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/database';
import BlogPost from './BlogPost';
import BlogTag from './BlogTag';

// Define the attributes interface
interface BlogPostTagAttributes {
  postId: number;
  tagId: number;
}

// Define the model class
class BlogPostTag extends Model<BlogPostTagAttributes> implements BlogPostTagAttributes {
  public postId!: number;
  public tagId!: number;

  // Association methods (will be added by Sequelize)
  public getPost!: () => Promise<BlogPost>;
  public setPost!: (post: BlogPost) => Promise<void>;
  public getTag!: () => Promise<BlogTag>;
  public setTag!: (tag: BlogTag) => Promise<void>;
}

// Initialize the model
BlogPostTag.init(
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
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'tag_id',
      references: {
        model: BlogTag,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'BlogPostTag',
    tableName: 'blog_post_tags',
    timestamps: false, // Junction tables typically don't need timestamps
    underscored: true,
    indexes: [
      {
        fields: ['post_id'], // Query all tags for a post
      },
      {
        fields: ['tag_id'], // Query all posts with a tag
      },
    ],
  }
);

export default BlogPostTag;