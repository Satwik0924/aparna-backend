import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../utils/database';
import slugify from 'slugify';

interface FaqCategoryAttributes {
  id: string;
  clientId: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FaqCategoryCreationAttributes extends Optional<FaqCategoryAttributes, 'id' | 'slug' | 'createdAt' | 'updatedAt'> {}

class FaqCategory extends Model<FaqCategoryAttributes, FaqCategoryCreationAttributes> implements FaqCategoryAttributes {
  public id!: string;
  public clientId!: string;
  public name!: string;
  public slug!: string;
  public description?: string;
  public color?: string;
  public icon?: string;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to generate unique slug
  static async generateSlug(name: string, clientId: string, id?: string): Promise<string> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingCategory = await FaqCategory.findOne({
        where: {
          slug,
          clientId,
          ...(id && { id: { [Op.ne]: id } })
        }
      });

      if (!existingCategory) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

FaqCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'client_id',
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
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: 'FaqCategory',
    tableName: 'faq_categories',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['client_id'],
      },
      {
        fields: ['slug', 'client_id'],
        unique: true,
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['sort_order'],
      },
    ],
    hooks: {
      beforeCreate: async (category: FaqCategory) => {
        if (!category.slug) {
          category.slug = await FaqCategory.generateSlug(category.name, category.clientId);
        }
      },
      beforeUpdate: async (category: FaqCategory) => {
        if (category.changed('name')) {
          category.slug = await FaqCategory.generateSlug(category.name, category.clientId, category.id);
        }
      },
    },
  }
);

export default FaqCategory;