import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface ContentTypeAttributes {
  id: string;
  name: 'page' | 'blog_post' | 'landing_page';
  displayName: string;
  fieldsSchema: object;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContentTypeCreationAttributes extends Optional<ContentTypeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ContentType extends Model<ContentTypeAttributes, ContentTypeCreationAttributes> implements ContentTypeAttributes {
  public id!: string;
  public name!: 'page' | 'blog_post' | 'landing_page';
  public displayName!: string;
  public fieldsSchema!: object;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContentType.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM('page', 'blog_post', 'landing_page'),
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fieldsSchema: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'ContentType',
    tableName: 'content_types',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['name'],
        unique: true,
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default ContentType;