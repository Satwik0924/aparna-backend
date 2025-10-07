import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyPriceRangeAttributes {
  id: string;
  propertyId: string;
  priceRangeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyPriceRangeCreationAttributes 
  extends Optional<PropertyPriceRangeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PropertyPriceRange extends Model<PropertyPriceRangeAttributes, PropertyPriceRangeCreationAttributes>
  implements PropertyPriceRangeAttributes {
  
  public id!: string;
  public propertyId!: string;
  public priceRangeId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PropertyPriceRange.init({
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
  priceRangeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'price_range_id',
    references: {
      model: 'dropdown_values',
      key: 'id',
    },
  }
}, {
  sequelize,
  modelName: 'PropertyPriceRange',
  tableName: 'property_price_ranges',
  underscored: true,
  timestamps: true,
});