import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyLayoutAttributes {
  id: string;
  propertyId: string;
  title: string;
  description?: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  cdnUrl?: string;
  altText?: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyLayoutCreationAttributes extends Optional<PropertyLayoutAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PropertyLayout extends Model<PropertyLayoutAttributes, PropertyLayoutCreationAttributes> implements PropertyLayoutAttributes {
  public id!: string;
  public propertyId!: string;
  public title!: string;
  public description?: string;
  public fileName!: string;
  public originalName!: string;
  public filePath!: string;
  public fileUrl!: string;
  public cdnUrl?: string;
  public altText?: string;
  public fileSize!: number;
  public mimeType!: string;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PropertyLayout.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'property_id',
      references: {
        model: 'properties',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'original_name',
    },
    filePath: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'file_path',
    },
    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'file_url',
    },
    cdnUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cdn_url',
    },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'alt_text',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'file_size',
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'PropertyLayout',
    tableName: 'property_layouts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['property_id'],
      },
      {
        fields: ['property_id', 'sort_order'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

export default PropertyLayout;