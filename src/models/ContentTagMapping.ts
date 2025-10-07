import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface ContentTagMappingAttributes {
  id: string;
  contentId: string;
  tagId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContentTagMappingCreationAttributes extends Optional<ContentTagMappingAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ContentTagMapping extends Model<ContentTagMappingAttributes, ContentTagMappingCreationAttributes> implements ContentTagMappingAttributes {
  public id!: string;
  public contentId!: string;
  public tagId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContentTagMapping.init(
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
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'content_tags',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'ContentTagMapping',
    tableName: 'content_tag_mappings',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['contentId'],
      },
      {
        fields: ['tagId'],
      },
      {
        fields: ['contentId', 'tagId'],
        unique: true,
      },
    ],
  }
);

export default ContentTagMapping;