import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyCustomFieldAttributes {
  id: string;
  propertyId: string;
  fieldKeyId: string;
  fieldValue: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface PropertyCustomFieldCreationAttributes extends Optional<PropertyCustomFieldAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PropertyCustomField extends Model<PropertyCustomFieldAttributes, PropertyCustomFieldCreationAttributes> implements PropertyCustomFieldAttributes {
  public id!: string;
  public propertyId!: string;
  public fieldKeyId!: string;
  public fieldValue!: string;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Association helpers (will be added by Sequelize associations)
  public fieldKey?: any; // DropdownValue
  public property?: any; // Property

  // Helper method to get formatted field info
  public getFieldInfo(): { key: string; value: string; sortOrder: number } {
    return {
      key: this.fieldKey?.value || 'Unknown Field',
      value: this.fieldValue,
      sortOrder: this.sortOrder
    };
  }
}

PropertyCustomField.init(
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
    fieldKeyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'field_key_id',
      references: {
        model: 'dropdown_values',
        key: 'id',
      },
    },
    fieldValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'field_value',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'PropertyCustomField',
    tableName: 'property_custom_fields',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['property_id'],
      },
      {
        fields: ['field_key_id'],
      },
      {
        fields: ['property_id', 'field_key_id'],
        unique: true,
        where: { deleted_at: null },
      },
      {
        fields: ['property_id', 'sort_order'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

export default PropertyCustomField;