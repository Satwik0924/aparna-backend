import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../utils/database';
import slugify from 'slugify';

interface ContentCategoryAttributes {
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

interface ContentCategoryCreationAttributes extends Optional<ContentCategoryAttributes, 'id' | 'slug' | 'createdAt' | 'updatedAt'> {}

class ContentCategory extends Model<ContentCategoryAttributes, ContentCategoryCreationAttributes> implements ContentCategoryAttributes {
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
      const existingCategory = await ContentCategory.findOne({
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

ContentCategory.init(
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
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'ContentCategory',
    tableName: 'content_categories',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['clientId'],
      },
      {
        fields: ['slug', 'clientId'],
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
      beforeCreate: async (category: ContentCategory) => {
        if (!category.slug) {
          category.slug = await ContentCategory.generateSlug(category.name, category.clientId);
        }
      },
      beforeUpdate: async (category: ContentCategory) => {
        if (category.changed('name')) {
          category.slug = await ContentCategory.generateSlug(category.name, category.clientId, category.id);
        }
      },
    },
  }
);

export default ContentCategory;