import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface MenuAttributes {
  id: string;
  clientId: string;
  name: string;
  type: 'header' | 'footer' | 'sidebar' | 'custom';
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MenuCreationAttributes extends Optional<MenuAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Menu extends Model<MenuAttributes, MenuCreationAttributes> implements MenuAttributes {
  public id!: string;
  public clientId!: string;
  public name!: string;
  public type!: 'header' | 'footer' | 'sidebar' | 'custom';
  public description?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Menu.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    type: {
      type: DataTypes.ENUM('header', 'footer', 'sidebar', 'custom'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Menu',
    tableName: 'menus',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['clientId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default Menu;