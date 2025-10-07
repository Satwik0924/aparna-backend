import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyAmenitiesHighlightAttributes {
  id: string;
  propertyId: string;
  parentId?: string;
  name?: string;
  value?: string;
  iconId?: string;
  iframeUrl?: string;
  level: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyAmenitiesHighlightCreationAttributes 
  extends Optional<PropertyAmenitiesHighlightAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PropertyAmenitiesHighlight extends Model<PropertyAmenitiesHighlightAttributes, PropertyAmenitiesHighlightCreationAttributes>
  implements PropertyAmenitiesHighlightAttributes {
  public id!: string;
  public propertyId!: string;
  public parentId?: string;
  public name?: string;
  public value?: string;
  public iconId?: string;
  public iframeUrl?: string;
  public level!: number;
  
  // Associations
  public icon?: any;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PropertyAmenitiesHighlight.init(
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
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    iconId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'icon_id',
    },
    iframeUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'iframe_url',
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 3,
      },
    },
  },
  {
    sequelize,
    tableName: 'property_amenities_highlights',
    timestamps: true,
    underscored: true,
  }
);

export default PropertyAmenitiesHighlight;