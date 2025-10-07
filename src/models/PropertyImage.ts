import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyImageAttributes {
  id: string;
  propertyId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  cdnUrl?: string;
  altText?: string;
  caption?: string;
  title?: string;
  description?: string;
  componentType: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isPrimary: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface PropertyImageCreationAttributes extends Optional<PropertyImageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PropertyImage extends Model<PropertyImageAttributes, PropertyImageCreationAttributes> implements PropertyImageAttributes {
  public id!: string;
  public propertyId!: string;
  public fileName!: string;
  public originalName!: string;
  public filePath!: string;
  public fileUrl!: string;
  public cdnUrl?: string;
  public altText?: string;
  public caption?: string;
  public title?: string;
  public description?: string;
  public componentType!: string;
  public fileSize!: number;
  public mimeType!: string;
  public width?: number;
  public height?: number;
  public isPrimary!: boolean;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Helper method to get file size in human readable format
  public getFormattedFileSize(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

PropertyImage.init(
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
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_path',
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_url',
    },
    cdnUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'cdn_url',
    },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'alt_text',
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    componentType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'gallery',
      field: 'component_type',
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'file_size',
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type',
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_primary',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'PropertyImage',
    tableName: 'property_images',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['property_id'],
      },
      {
        fields: ['property_id', 'is_primary'],
      },
      {
        fields: ['property_id', 'sort_order'],
      },
      {
        fields: ['property_id', 'component_type'],
      },
      {
        fields: ['component_type'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

export default PropertyImage;