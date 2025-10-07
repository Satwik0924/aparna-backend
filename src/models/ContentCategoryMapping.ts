import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface ContentCategoryMappingAttributes {
  id: string;
  contentId: string;
  categoryId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContentCategoryMappingCreationAttributes extends Optional<ContentCategoryMappingAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ContentCategoryMapping extends Model<ContentCategoryMappingAttributes, ContentCategoryMappingCreationAttributes> implements ContentCategoryMappingAttributes {
  public id!: string;
  public contentId!: string;
  public categoryId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContentCategoryMapping.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'content_items',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'content_categories',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'ContentCategoryMapping',
    tableName: 'content_category_mappings',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['contentId'],
      },
      {
        fields: ['categoryId'],
      },
      {
        fields: ['contentId', 'categoryId'],
        unique: true,
      },
    ],
  }
);

export default ContentCategoryMapping;