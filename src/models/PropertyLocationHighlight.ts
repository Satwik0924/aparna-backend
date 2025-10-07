import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyLocationHighlightAttributes {
  id: string;
  propertyId: string;
  parentId?: string;
  name?: string;
  value?: string;
  iconId?: string;
  iframeUrl?: string;
  level: number;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyLocationHighlightCreationAttributes extends Optional<PropertyLocationHighlightAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PropertyLocationHighlight extends Model<PropertyLocationHighlightAttributes, PropertyLocationHighlightCreationAttributes> implements PropertyLocationHighlightAttributes {
  public id!: string;
  public propertyId!: string;
  public parentId?: string;
  public name?: string;
  public value?: string;
  public iconId?: string;
  public iframeUrl?: string;
  public level!: number;
  public sortOrder?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public children?: PropertyLocationHighlight[];
  public parent?: PropertyLocationHighlight;
  public icon?: any; // MediaFile association
}

PropertyLocationHighlight.init(
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id',
      references: {
        model: 'property_location_highlights',
        key: 'id',
      },
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
      references: {
        model: 'media_files',
        key: 'id',
      },
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
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sort_order',
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'PropertyLocationHighlight',
    tableName: 'property_location_highlights',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['property_id'],
      },
      {
        fields: ['parent_id'],
      },
      {
        fields: ['property_id', 'level'],
      },
      {
        fields: ['property_id', 'parent_id'],
      },
    ],
  }
);

// Set up associations
PropertyLocationHighlight.hasMany(PropertyLocationHighlight, {
  sourceKey: 'id',
  foreignKey: 'parentId',
  as: 'children',
});

PropertyLocationHighlight.belongsTo(PropertyLocationHighlight, {
  targetKey: 'id',
  foreignKey: 'parentId',
  as: 'parent',
});

export default PropertyLocationHighlight;