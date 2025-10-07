import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyConfigurationAttributes {
  id: string;
  propertyId: string;
  configurationId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyConfigurationCreationAttributes 
  extends Optional<PropertyConfigurationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PropertyConfiguration extends Model<PropertyConfigurationAttributes, PropertyConfigurationCreationAttributes>
  implements PropertyConfigurationAttributes {
  
  public id!: string;
  public propertyId!: string;
  public configurationId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PropertyConfiguration.init({
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
  configurationId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'configuration_id',
    references: {
      model: 'dropdown_values',
      key: 'id',
    },
  }
}, {
  sequelize,
  modelName: 'PropertyConfiguration',
  tableName: 'property_configurations',
  underscored: true,
  timestamps: true,
});