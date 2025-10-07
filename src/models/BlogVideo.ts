import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';
import Client from './Client';

// Define the attributes interface
interface BlogVideoAttributes {
  id: number;
  uuid: string;
  clientId: string;
  youtubeId: string;
  title: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields during creation)
interface BlogVideoCreationAttributes extends Optional<BlogVideoAttributes, 'id' | 'uuid' | 'createdAt' | 'updatedAt'> {}

// Define the model class
class BlogVideo extends Model<BlogVideoAttributes, BlogVideoCreationAttributes> implements BlogVideoAttributes {
  public id!: number;
  public uuid!: string;
  public clientId!: string;
  public youtubeId!: string;
  public title!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods (will be added by Sequelize)
  public getClient!: () => Promise<Client>;
  public setClient!: (client: Client) => Promise<void>;

  // Helper methods
  public getYouTubeUrl(): string {
    return `https://www.youtube.com/watch?v=${this.youtubeId}`;
  }

  public getYouTubeThumbnail(quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string {
    return `https://img.youtube.com/vi/${this.youtubeId}/${quality}default.jpg`;
  }

  public getYouTubeEmbedUrl(): string {
    return `https://www.youtube.com/embed/${this.youtubeId}`;
  }
}

// Initialize the model
BlogVideo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'client_id',
      references: {
        model: Client,
        key: 'id',
      },
    },
    youtubeId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'youtube_id',
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'BlogVideo',
    tableName: 'blog_videos',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['client_id'], // Index for client queries
      },
      {
        unique: true,
        fields: ['client_id', 'youtube_id'], // Ensure youtube_id is unique per client
      },
    ],
  }
);

export default BlogVideo;