import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface MenuItemAttributes {
  id: string;
  menuId: string;
  parentId?: string;
  title: string;
  url: string;
  linkType: 'internal' | 'external' | 'property' | 'category' | 'custom';
  targetBlank: boolean;
  cssClasses?: string;
  iconClass?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MenuItemCreationAttributes extends Optional<MenuItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MenuItem extends Model<MenuItemAttributes, MenuItemCreationAttributes> implements MenuItemAttributes {
  public id!: string;
  public menuId!: string;
  public parentId?: string;
  public title!: string;
  public url!: string;
  public linkType!: 'internal' | 'external' | 'property' | 'category' | 'custom';
  public targetBlank!: boolean;
  public cssClasses?: string;
  public iconClass?: string;
  public description?: string;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to check if item is a parent menu item
  public isParent(): boolean {
    return this.parentId === null || this.parentId === undefined;
  }

  // Helper method to check if item is a child menu item
  public isChild(): boolean {
    return this.parentId !== null && this.parentId !== undefined;
  }

  // Helper method to get target attribute
  public getTarget(): string {
    return this.targetBlank ? '_blank' : '_self';
  }
}

MenuItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    menuId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'menus',
        key: 'id',
      },
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'menu_items',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    linkType: {
      type: DataTypes.ENUM('internal', 'external', 'property', 'category', 'custom'),
      allowNull: false,
    },
    targetBlank: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    cssClasses: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    iconClass: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'MenuItem',
    tableName: 'menu_items',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['menuId'],
      },
      {
        fields: ['parentId'],
      },
      {
        fields: ['menuId', 'parentId'],
      },
      {
        fields: ['sortOrder'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default MenuItem;