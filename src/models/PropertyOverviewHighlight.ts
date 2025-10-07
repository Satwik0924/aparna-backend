import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyOverviewHighlightAttributes {
  id: string;
  propertyId: string;
  name: string;
  iconId?: string;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyOverviewHighlightCreationAttributes extends Optional<PropertyOverviewHighlightAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PropertyOverviewHighlight extends Model<PropertyOverviewHighlightAttributes, PropertyOverviewHighlightCreationAttributes> implements PropertyOverviewHighlightAttributes {
  public id!: string;
  public propertyId!: string;
  public name!: string;
  public iconId?: string;
  public sortOrder?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public icon?: any; // MediaFile association
}

PropertyOverviewHighlight.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    iconId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'icon_id',
      references: {
        model: 'media_files',
        key: 'id',
      },
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sort_order',
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'PropertyOverviewHighlight',
    tableName: 'property_overview_highlights',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['property_id'],
      },
      {
        fields: ['sort_order'],
      },
    ],
  }
);

export default PropertyOverviewHighlight;