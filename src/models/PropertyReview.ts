import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyReviewAttributes {
  id: string;
  propertyId: string;
  customerName: string;
  designation?: string;
  reviewText: string;
  rating: number;
  customerPhotoUrl?: string;
  customerPhotoPath?: string;
  customerPhotoAlt?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyReviewCreationAttributes 
  extends Optional<PropertyReviewAttributes, 'id' | 'sortOrder' | 'isActive' | 'isFeatured' | 'createdAt' | 'updatedAt'> {}

export class PropertyReview extends Model<PropertyReviewAttributes, PropertyReviewCreationAttributes>
  implements PropertyReviewAttributes {
  
  public id!: string;
  public propertyId!: string;
  public customerName!: string;
  public designation?: string;
  public reviewText!: string;
  public rating!: number;
  public customerPhotoUrl?: string;
  public customerPhotoPath?: string;
  public customerPhotoAlt?: string;
  public sortOrder!: number;
  public isActive!: boolean;
  public isFeatured!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods will be added in index.ts
}

PropertyReview.init(
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
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'customer_name',
    },
    designation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reviewText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'review_text',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    customerPhotoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'customer_photo_url',
    },
    customerPhotoPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'customer_photo_path',
    },
    customerPhotoAlt: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'customer_photo_alt',
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
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_featured',
    },
  },
  {
    sequelize,
    modelName: 'PropertyReview',
    tableName: 'property_reviews',
    timestamps: true,
    underscored: true,
    paranoid: false,
  }
);

export { PropertyReviewAttributes, PropertyReviewCreationAttributes };