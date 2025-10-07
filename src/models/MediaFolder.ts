import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface MediaFolderAttributes {
  id: string;
  clientId: string;
  name: string;
  parentId?: string;
  path: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MediaFolderCreationAttributes extends Optional<MediaFolderAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MediaFolder extends Model<MediaFolderAttributes, MediaFolderCreationAttributes> implements MediaFolderAttributes {
  public id!: string;
  public clientId!: string;
  public name!: string;
  public parentId?: string;
  public path!: string;
  public description?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to generate full path
  static async generatePath(name: string, parentId?: string): Promise<string> {
    if (!parentId) {
      return `/${name}`;
    }

    const parentFolder = await MediaFolder.findByPk(parentId);
    if (!parentFolder) {
      return `/${name}`;
    }

    return `${parentFolder.path}/${name}`;
  }
}

MediaFolder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'media_folders',
        key: 'id',
      },
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'MediaFolder',
    tableName: 'media_folders',
    timestamps: true,
    paranoid: false,
    underscored: true,
    indexes: [
      {
        fields: ['clientId'],
      },
      {
        fields: ['parentId'],
      },
      {
        fields: ['clientId', 'parentId'],
      },
      {
        fields: ['isActive'],
      },
    ],
    hooks: {
      beforeCreate: async (folder: MediaFolder) => {
        if (!folder.path) {
          folder.path = await MediaFolder.generatePath(folder.name, folder.parentId);
        }
      },
      beforeUpdate: async (folder: MediaFolder) => {
        if (folder.changed('name') || folder.changed('parentId')) {
          folder.path = await MediaFolder.generatePath(folder.name, folder.parentId);
        }
      },
    },
  }
);

export default MediaFolder;