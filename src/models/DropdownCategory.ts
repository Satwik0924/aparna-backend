import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface DropdownCategoryAttributes {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DropdownCategoryCreationAttributes extends Optional<DropdownCategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class DropdownCategory extends Model<DropdownCategoryAttributes, DropdownCategoryCreationAttributes> implements DropdownCategoryAttributes {
  declare id: string;
  declare name: string;
  declare description?: string;
  declare parentId?: string | null;
  declare level: number;
  declare sortOrder: number;
  declare isActive: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Association methods (will be defined in index.ts)
  public parent?: DropdownCategory;
  public children?: DropdownCategory[];
  public values?: any[];
  public getParent!: () => Promise<DropdownCategory | null>;
  public getChildren!: () => Promise<DropdownCategory[]>;
  public getValues!: () => Promise<any[]>;
  public setParent!: (parent: DropdownCategory | null) => Promise<void>;
  public addChild!: (child: DropdownCategory) => Promise<void>;

  // Helper methods
  public isPrimaryCategory(): boolean {
    return this.level === 0 && this.parentId === null;
  }

  public isSubCategory(): boolean {
    return this.level === 1 && this.parentId !== null;
  }

  public async getFullPath(): Promise<string> {
    if (this.isPrimaryCategory()) {
      return this.name;
    }
    
    const parent = await this.getParent();
    if (parent) {
      return `${parent.name} > ${this.name}`;
    }
    
    return this.name;
  }
}

DropdownCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id',
      references: {
        model: 'dropdown_categories',
        key: 'id',
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 1,
      },
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    modelName: 'DropdownCategory',
    tableName: 'dropdown_categories',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['name', 'parent_id'],
        unique: true,
        name: 'uk_dropdown_categories_name_parent'
      },
      {
        fields: ['parent_id'],
        name: 'idx_dropdown_categories_parent_id'
      },
      {
        fields: ['level'],
        name: 'idx_dropdown_categories_level'
      },
      {
        fields: ['sort_order'],
        name: 'idx_dropdown_categories_sort_order'
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default DropdownCategory;