import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyTextComponentAttributes {
  id: string;
  propertyId: string;
  title?: string;
  content: string;
  iconId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PropertyTextComponentCreationAttributes 
  extends Optional<PropertyTextComponentAttributes, 'id' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class PropertyTextComponent extends Model<PropertyTextComponentAttributes, PropertyTextComponentCreationAttributes>
  implements PropertyTextComponentAttributes {
  public id!: string;
  public propertyId!: string;
  public title?: string;
  public content!: string;
  public iconId?: string;
  public sortOrder!: number;
  public isActive!: boolean;
  
  // Associations
  public icon?: any;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PropertyTextComponent.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    iconId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'icon_id',
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
  },
  {
    sequelize,
    tableName: 'property_text_components',
    timestamps: true,
    underscored: true,
  }
);

export default PropertyTextComponent;