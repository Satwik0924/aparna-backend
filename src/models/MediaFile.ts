import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface MediaFileAttributes {
  id: string;
  clientId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  spacesUrl: string;
  cdnUrl?: string;
  fileType: 'image' | 'video' | 'document' | 'audio' | 'other';
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
  caption?: string;
  description?: string;
  folderId?: string | null;
  uploadedBy: string | null;
  tags?: string[];
  metadata?: object;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface MediaFileCreationAttributes extends Optional<MediaFileAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MediaFile extends Model<MediaFileAttributes, MediaFileCreationAttributes> implements MediaFileAttributes {
  public id!: string;
  public clientId!: string;
  public originalName!: string;
  public fileName!: string;
  public filePath!: string;
  public spacesUrl!: string;
  public cdnUrl?: string;
  public fileType!: 'image' | 'video' | 'document' | 'audio' | 'other';
  public mimeType!: string;
  public fileSize!: number;
  public width?: number;
  public height?: number;
  public duration?: number;
  public altText?: string;
  public caption?: string;
  public description?: string;
  public folderId?: string | null;
public uploadedBy!: string | null;
  public tags?: string[];
  public metadata?: object;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Helper method to get file size in human readable format
  public getFormattedFileSize(): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  // Helper method to get file extension
  public getFileExtension(): string {
    return this.fileName.split('.').pop()?.toLowerCase() || '';
  }

  // Helper method to check if file is image
  public isImage(): boolean {
    return this.fileType === 'image' || this.mimeType.startsWith('image/');
  }

  // Helper method to check if file is video
  public isVideo(): boolean {
    return this.fileType === 'video' || this.mimeType.startsWith('video/');
  }

  // Helper method to check if file is document
  public isDocument(): boolean {
    return this.fileType === 'document' || 
           this.mimeType.includes('pdf') || 
           this.mimeType.includes('document') ||
           this.mimeType.includes('text/');
  }

  // Helper method to get optimized URL
  public getOptimizedUrl(width?: number, height?: number, quality?: number): string {
    if (!this.cdnUrl) return this.spacesUrl;
    
    let url = this.cdnUrl;
    const params = [];
    
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    if (quality) params.push(`q=${quality}`);
    
    if (params.length > 0 && this.isImage()) {
      url += `?${params.join('&')}`;
    }
    
    return url;
  }
}

MediaFile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'client_id',
      references: {
        model: 'clients',
        key: 'id',
      },
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'original_name',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_path',
    },
    spacesUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'spaces_url',
    },
    cdnUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'cdn_url',
    },
    fileType: {
      type: DataTypes.ENUM('image', 'video', 'document', 'audio', 'other'),
      allowNull: false,
      field: 'file_type',
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type',
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'file_size',
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    folderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'folder_id',
      references: {
        model: 'media_folders',
        key: 'id',
      },
    },
   uploadedBy: {
  type: DataTypes.UUID,
  allowNull: true,  // CHANGE THIS FROM false TO true
  field: 'uploaded_by',
  references: {
    model: 'users',
    key: 'id',
  },
},
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'MediaFile',
    tableName: 'media_files',
    timestamps: true,
    paranoid: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['clientId'],
      },
      {
        fields: ['folderId'],
      },
      {
        fields: ['fileType'],
      },
      {
        fields: ['mimeType'],
      },
      {
        fields: ['uploadedBy'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default MediaFile;