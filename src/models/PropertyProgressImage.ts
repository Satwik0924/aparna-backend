import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyProgressImageAttributes {
  id: string;
  propertyId: string;
  year: number;
  month: number;
  imageUrl: string;
  alt?: string;
  title?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PropertyProgressImageCreationAttributes 
  extends Optional<PropertyProgressImageAttributes, 'id' | 'alt' | 'title' | 'description' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class PropertyProgressImage extends Model<PropertyProgressImageAttributes, PropertyProgressImageCreationAttributes>
  implements PropertyProgressImageAttributes {
  public id!: string;
  public propertyId!: string;
  public year!: number;
  public month!: number;
  public imageUrl!: string;
  public alt!: string;
  public title!: string;
  public description!: string;
  public sortOrder!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PropertyProgressImage.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'property_id'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: 2100
      }
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12
      }
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'image_url'
    },
    alt: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: ''
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: ''
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'property_progress_images',
    modelName: 'PropertyProgressImage',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['property_id']
      },
      {
        fields: ['property_id', 'year', 'month']
      },
      {
        fields: ['year', 'month']
      }
    ]
  }
);

export default PropertyProgressImage;