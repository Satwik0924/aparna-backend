import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';
import Client from './Client';

// Define the attributes interface
interface BlogTagAttributes {
  id: number;
  uuid: string;
  clientId: string;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields during creation)
interface BlogTagCreationAttributes extends Optional<BlogTagAttributes, 'id' | 'uuid' | 'createdAt' | 'updatedAt'> {}

// Define the model class
class BlogTag extends Model<BlogTagAttributes, BlogTagCreationAttributes> implements BlogTagAttributes {
  public id!: number;
  public uuid!: string;
  public clientId!: string;
  public name!: string;
  public slug!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods (will be added by Sequelize)
  public getClient!: () => Promise<Client>;
  public setClient!: (client: Client) => Promise<void>;
}

// Initialize the model
BlogTag.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'BlogTag',
    tableName: 'blog_tags',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['client_id', 'slug'], // Ensure slug is unique per client
      },
      {
        fields: ['client_id'], // Index for client queries
      },
    ],
  }
);

export default BlogTag;