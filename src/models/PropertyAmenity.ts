import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyAmenityAttributes {
  id: string;
  propertyId: string;
  amenityId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyAmenityCreationAttributes extends Optional<PropertyAmenityAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PropertyAmenity extends Model<PropertyAmenityAttributes, PropertyAmenityCreationAttributes> implements PropertyAmenityAttributes {
  public id!: string;
  public propertyId!: string;
  public amenityId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PropertyAmenity.init(
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
    amenityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'dropdown_values',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'PropertyAmenity',
    tableName: 'property_amenities',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['propertyId'],
      },
      {
        fields: ['amenityId'],
      },
      {
        fields: ['propertyId', 'amenityId'],
        unique: true,
      },
    ],
  }
);

export default PropertyAmenity;