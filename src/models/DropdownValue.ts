import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../utils/database';
import slugify from 'slugify';

interface DropdownValueAttributes {
  id: string;
  categoryId: string;
  clientId?: string;
  parentId?: string;
  value: string;
  slug: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DropdownValueCreationAttributes extends Optional<DropdownValueAttributes, 'id' | 'slug' | 'createdAt' | 'updatedAt'> {}

class DropdownValue extends Model<DropdownValueAttributes, DropdownValueCreationAttributes> implements DropdownValueAttributes {
  declare id: string;
  declare categoryId: string;
  declare clientId?: string;
  declare parentId?: string;
  declare value: string;
  declare slug: string;
  declare color?: string;
  declare icon?: string;
  declare sortOrder: number;
  declare isActive: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Helper method to generate unique slug
  static async generateSlug(value: string, categoryId: string, clientId?: string, id?: string): Promise<string> {
    let baseSlug = slugify(value, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingValue = await DropdownValue.findOne({
        where: {
          slug,
          categoryId,
          ...(clientId && { clientId }),
          ...(id && { id: { [Op.ne]: id } })
        }
      });

      if (!existingValue) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

DropdownValue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'dropdown_categories',
        key: 'id',
      },
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'client_id',
      references: {
        model: 'clients',
        key: 'id',
      },
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id',
      references: {
        model: 'dropdown_values',
        key: 'id',
      },
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
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
    modelName: 'DropdownValue',
    tableName: 'dropdown_values',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['categoryId'],
      },
      {
        fields: ['clientId'],
      },
      {
        fields: ['slug', 'categoryId', 'clientId'],
        unique: true,
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['sortOrder'],
      },
    ],
    hooks: {
      beforeCreate: async (dropdownValue: DropdownValue) => {
        if (!dropdownValue.slug) {
          dropdownValue.slug = slugify(dropdownValue.value, { lower: true, strict: true });
        }
      },
      beforeUpdate: async (dropdownValue: DropdownValue) => {
        if (dropdownValue.changed('value')) {
          dropdownValue.slug = await DropdownValue.generateSlug(
            dropdownValue.value,
            dropdownValue.categoryId,
            dropdownValue.clientId,
            dropdownValue.id
          );
        }
      },
    },
  }
);

export default DropdownValue;