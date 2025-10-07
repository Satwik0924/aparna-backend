import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyDocumentAttributes {
  id: string;
  propertyId: string;
  title: string;
  documentType: 'legal' | 'brochure' | 'floor_plan' | 'rera' | 'noc' | 'approval' | 'other';
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  cdnUrl?: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  isPublic: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyDocumentCreationAttributes extends Optional<PropertyDocumentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PropertyDocument extends Model<PropertyDocumentAttributes, PropertyDocumentCreationAttributes> implements PropertyDocumentAttributes {
  public id!: string;
  public propertyId!: string;
  public title!: string;
  public documentType!: 'legal' | 'brochure' | 'floor_plan' | 'rera' | 'noc' | 'approval' | 'other';
  public fileName!: string;
  public originalName!: string;
  public filePath!: string;
  public fileUrl!: string;
  public cdnUrl?: string;
  public fileSize!: number;
  public mimeType!: string;
  public description?: string;
  public isPublic!: boolean;
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

  // Helper method to get document type display name
  public getDocumentTypeDisplayName(): string {
    const displayNames = {
      'legal': 'Legal Document',
      'brochure': 'Brochure',
      'floor_plan': 'Floor Plan',
      'rera': 'RERA Document',
      'noc': 'NOC Document',
      'approval': 'Approval Document',
      'other': 'Other Document'
    };

    return displayNames[this.documentType] || 'Unknown Document';
  }
}

PropertyDocument.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    documentType: {
      type: DataTypes.ENUM('legal', 'brochure', 'floor_plan', 'rera', 'noc', 'approval', 'other'),
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    cdnUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'PropertyDocument',
    tableName: 'property_documents',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['propertyId'],
      },
      {
        fields: ['propertyId', 'documentType'],
      },
      {
        fields: ['isPublic'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['sortOrder'],
      },
    ],
  }
);

export default PropertyDocument;