import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../utils/database';
import slugify from 'slugify';

interface ContentTagAttributes {
  id: string;
  clientId: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContentTagCreationAttributes extends Optional<ContentTagAttributes, 'id' | 'slug' | 'createdAt' | 'updatedAt'> {}

class ContentTag extends Model<ContentTagAttributes, ContentTagCreationAttributes> implements ContentTagAttributes {
  public id!: string;
  public clientId!: string;
  public name!: string;
  public slug!: string;
  public color?: string;
  public description?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to generate unique slug
  static async generateSlug(name: string, clientId: string, id?: string): Promise<string> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingTag = await ContentTag.findOne({
        where: {
          slug,
          clientId,
          ...(id && { id: { [Op.ne]: id } })
        }
      });

      if (!existingTag) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

ContentTag.init(
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
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
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
    modelName: 'ContentTag',
    tableName: 'content_tags',
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
    ],
    hooks: {
      beforeCreate: async (tag: ContentTag) => {
        if (!tag.slug) {
          tag.slug = await ContentTag.generateSlug(tag.name, tag.clientId);
        }
      },
      beforeUpdate: async (tag: ContentTag) => {
        if (tag.changed('name')) {
          tag.slug = await ContentTag.generateSlug(tag.name, tag.clientId, tag.id);
        }
      },
    },
  }
);

export default ContentTag;