import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';
import Client from './Client';
import User from './User';

// Define the attributes interface
interface BlogMediaAttributes {
  id: number;
  uuid: string;
  clientId: string;
  fileName: string;
  spacesKey?: string;
  link?: string;
  fileType: string;
  fileSize?: number;
  altText?: string;
  uploadedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields during creation)
interface BlogMediaCreationAttributes extends Optional<BlogMediaAttributes, 'id' | 'uuid' | 'createdAt' | 'updatedAt'> {}

// Define the model class
class BlogMedia extends Model<BlogMediaAttributes, BlogMediaCreationAttributes> implements BlogMediaAttributes {
  public id!: number;
  public uuid!: string;
  public clientId!: string;
  public fileName!: string;
  public spacesKey?: string;
  public link?: string;
  public fileType!: string;
  public fileSize?: number;
  public altText?: string;
  public uploadedBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods (will be added by Sequelize)
  public getClient!: () => Promise<Client>;
  public setClient!: (client: Client) => Promise<void>;
  public getUploader!: () => Promise<User>;
  public setUploader!: (user: User) => Promise<void>;

  // Helper methods
  public getUrl(): string {
    if (this.link) {
      return this.link;
    }
    if (this.spacesKey) {
      return `https://d2tdzhum1kggza.cloudfront.net/${this.spacesKey}`;
    }
    return '';
  }

  public isImage(): boolean {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageTypes.includes(this.fileType.toLowerCase());
  }

  public isVideo(): boolean {
    const videoTypes = ['mp4', 'webm', 'mov', 'avi'];
    return videoTypes.includes(this.fileType.toLowerCase());
  }

  public isDocument(): boolean {
    const docTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
    return docTypes.includes(this.fileType.toLowerCase());
  }

  public getFormattedFileSize(): string {
    if (!this.fileSize) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
    return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Initialize the model
BlogMedia.init(
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
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
      validate: {
        notEmpty: true,
      },
    },
    spacesKey: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'spaces_key',
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Link must be a valid URL',
        },
      },
    },
    fileType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'file_type',
      validate: {
        notEmpty: true,
      },
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'file_size',
      validate: {
        min: 0,
      },
    },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'alt_text',
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'uploaded_by',
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'BlogMedia',
    tableName: 'blog_media',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['client_id'], // Index for client queries
      },
      {
        fields: ['file_type'], // Index for file type queries
      },
      {
        fields: ['uploaded_by'], // Index for uploader queries
      },
    ],
  }
);

export default BlogMedia;