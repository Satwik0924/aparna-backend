import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyFloorPlanAttributes {
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
  width?: number;
  height?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyFloorPlanCreationAttributes extends Optional<PropertyFloorPlanAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PropertyFloorPlan extends Model<PropertyFloorPlanAttributes, PropertyFloorPlanCreationAttributes> implements PropertyFloorPlanAttributes {
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
  public width?: number;
  public height?: number;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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

PropertyFloorPlan.init(
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
    modelName: 'PropertyFloorPlan',
    tableName: 'property_floor_plans',
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
        fields: ['property_id', 'sort_order'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

export default PropertyFloorPlan;