import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../utils/database';
import slugify from 'slugify';

interface ContentItemAttributes {
  id: string;
  clientId: string;
  typeId: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featuredImageId?: string;
  status: 'draft' | 'published' | 'scheduled';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  authorId: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  viewCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContentItemCreationAttributes extends Optional<ContentItemAttributes, 'id' | 'slug' | 'createdAt' | 'updatedAt'> {}

class ContentItem extends Model<ContentItemAttributes, ContentItemCreationAttributes> implements ContentItemAttributes {
  public id!: string;
  public clientId!: string;
  public typeId!: string;
  public title!: string;
  public slug!: string;
  public content?: string;
  public excerpt?: string;
  public featuredImageId?: string;
  public status!: 'draft' | 'published' | 'scheduled';
  public seoTitle?: string;
  public seoDescription?: string;
  public seoKeywords?: string;
  public authorId!: string;
  public publishedAt?: Date;
  public scheduledAt?: Date;
  public viewCount!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to generate unique slug
  static async generateSlug(title: string, clientId: string, id?: string): Promise<string> {
    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingContent = await ContentItem.findOne({
        where: {
          slug,
          clientId,
          ...(id && { id: { [Op.ne]: id } })
        }
      });

      if (!existingContent) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Helper method to get formatted excerpt
  public getFormattedExcerpt(length: number = 150): string {
    if (this.excerpt) {
      return this.excerpt.length > length 
        ? this.excerpt.substring(0, length) + '...'
        : this.excerpt;
    }

    if (this.content) {
      const textContent = this.content.replace(/<[^>]*>/g, '');
      return textContent.length > length 
        ? textContent.substring(0, length) + '...'
        : textContent;
    }

    return '';
  }

  // Helper method to check if content is published
  public isPublished(): boolean {
    return this.status === 'published' && this.publishedAt !== null;
  }

  // Helper method to increment view count
  public async incrementViewCount(): Promise<void> {
    await this.increment('viewCount');
  }
}

ContentItem.init(
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
    typeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'content_types',
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
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    featuredImageId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'scheduled'),
      defaultValue: 'draft',
    },
    seoTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seoKeywords: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    viewCount: {
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
    modelName: 'ContentItem',
    tableName: 'content_items',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['clientId'],
      },
      {
        fields: ['typeId'],
      },
      {
        fields: ['slug', 'clientId'],
        unique: true,
      },
      {
        fields: ['status'],
      },
      {
        fields: ['publishedAt'],
      },
      {
        fields: ['authorId'],
      },
      {
        fields: ['isActive'],
      },
    ],
    hooks: {
      beforeCreate: async (contentItem: ContentItem) => {
        if (!contentItem.slug) {
          contentItem.slug = await ContentItem.generateSlug(contentItem.title, contentItem.clientId);
        }
      },
      beforeUpdate: async (contentItem: ContentItem) => {
        if (contentItem.changed('title')) {
          contentItem.slug = await ContentItem.generateSlug(contentItem.title, contentItem.clientId, contentItem.id);
        }
      },
    },
  }
);

export default ContentItem;