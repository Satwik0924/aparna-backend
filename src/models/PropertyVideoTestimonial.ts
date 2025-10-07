import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';
import Property from './Property';

interface PropertyVideoTestimonialAttributes {
  id: string;
  propertyId: string;
  customerName: string;
  designation?: string;
  testimonialText: string;
  youtubeUrl: string;
  rating: number;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface PropertyVideoTestimonialCreationAttributes extends Optional<PropertyVideoTestimonialAttributes, 'id' | 'designation' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class PropertyVideoTestimonial extends Model<PropertyVideoTestimonialAttributes, PropertyVideoTestimonialCreationAttributes> implements PropertyVideoTestimonialAttributes {
  public id!: string;
  public propertyId!: string;
  public customerName!: string;
  public designation?: string;
  public testimonialText!: string;
  public youtubeUrl!: string;
  public rating!: number;
  public sortOrder!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Associations
  public readonly property?: Property;
}

PropertyVideoTestimonial.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id'
      },
      onDelete: 'CASCADE',
      field: 'property_id'
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'customer_name'
    },
    designation: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    testimonialText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'testimonial_text'
    },
    youtubeUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'youtube_url',
      validate: {
        isUrl: true,
        isYoutubeUrl(value: string) {
          if (!value.match(/^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/)) {
            throw new Error('Must be a valid YouTube URL');
          }
        }
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
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
    }
  },
  {
    sequelize,
    tableName: 'property_video_testimonials',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['property_id']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['sort_order']
      }
    ]
  }
);

export default PropertyVideoTestimonial;