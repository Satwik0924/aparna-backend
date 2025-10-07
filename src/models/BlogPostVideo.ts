import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/database';
import BlogPost from './BlogPost';
import BlogVideo from './BlogVideo';

// Define the attributes interface
interface BlogPostVideoAttributes {
  postId: number;
  videoId: number;
  displayOrder?: number;
}

// Define the model class
class BlogPostVideo extends Model<BlogPostVideoAttributes> implements BlogPostVideoAttributes {
  public postId!: number;
  public videoId!: number;
  public displayOrder?: number;

  // Association methods (will be added by Sequelize)
  public getPost!: () => Promise<BlogPost>;
  public setPost!: (post: BlogPost) => Promise<void>;
  public getVideo!: () => Promise<BlogVideo>;
  public setVideo!: (video: BlogVideo) => Promise<void>;
}

// Initialize the model
BlogPostVideo.init(
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
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'video_id',
      references: {
        model: BlogVideo,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'display_order',
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    modelName: 'BlogPostVideo',
    tableName: 'blog_post_videos',
    timestamps: false, // Junction tables typically don't need timestamps
    underscored: true,
    indexes: [
      {
        fields: ['post_id'], // Query all videos for a post
      },
      {
        fields: ['video_id'], // Query all posts with a video
      },
      {
        fields: ['post_id', 'display_order'], // Order videos within a post
      },
    ],
  }
);

export default BlogPostVideo;