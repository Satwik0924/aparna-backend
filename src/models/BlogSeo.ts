import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';
import Client from './Client';

// Define the attributes interface
interface BlogSeoAttributes {
  id: number;
  uuid: string;
  clientId: string;
  entityType: string;
  entityId: number;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageId?: number;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageId?: number;
  focusKeyword?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields during creation)
interface BlogSeoCreationAttributes extends Optional<BlogSeoAttributes, 'id' | 'uuid' | 'createdAt' | 'updatedAt'> {}

// Define the model class
class BlogSeo extends Model<BlogSeoAttributes, BlogSeoCreationAttributes> implements BlogSeoAttributes {
  public id!: number;
  public uuid!: string;
  public clientId!: string;
  public entityType!: string;
  public entityId!: number;
  public metaTitle?: string;
  public metaDescription?: string;
  public canonicalUrl?: string;
  public ogTitle?: string;
  public ogDescription?: string;
  public ogImageId?: number;
  public twitterTitle?: string;
  public twitterDescription?: string;
  public twitterImageId?: number;
  public focusKeyword?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods (will be added by Sequelize)
  public getClient!: () => Promise<Client>;
  public setClient!: (client: Client) => Promise<void>;

  // Helper methods
  public getMetaTitleOrDefault(defaultTitle: string): string {
    return this.metaTitle || defaultTitle;
  }

  public getMetaDescriptionOrDefault(defaultDescription: string): string {
    return this.metaDescription || defaultDescription;
  }

  public getOgTitleOrDefault(fallbackTitle: string): string {
    return this.ogTitle || this.metaTitle || fallbackTitle;
  }

  public getOgDescriptionOrDefault(fallbackDescription: string): string {
    return this.ogDescription || this.metaDescription || fallbackDescription;
  }

  public getTwitterTitleOrDefault(fallbackTitle: string): string {
    return this.twitterTitle || this.ogTitle || this.metaTitle || fallbackTitle;
  }

  public getTwitterDescriptionOrDefault(fallbackDescription: string): string {
    return this.twitterDescription || this.ogDescription || this.metaDescription || fallbackDescription;
  }

  public hasCompleteBasicSeo(): boolean {
    return !!(this.metaTitle && this.metaDescription);
  }

  public hasCompleteOpenGraph(): boolean {
    return !!(this.ogTitle && this.ogDescription);
  }

  public hasCompleteTwitter(): boolean {
    return !!(this.twitterTitle && this.twitterDescription);
  }
}

// Initialize the model
BlogSeo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'client_id',
      references: {
        model: Client,
        key: 'id',
      },
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'entity_type',
      validate: {
        isIn: [['post', 'category', 'tag']], // Define valid entity types
      },
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'entity_id',
    },
    metaTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'meta_title',
      validate: {
        len: [0, 300], // SEO best practice: 50-60 characters
      },
    },
    metaDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'meta_description'
    },
    canonicalUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'canonical_url',
      validate: {
        isUrl: true,
      },
    },
    ogTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'og_title',
    },
    ogDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'og_description',
    },
    ogImageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'og_image_id',
    },
    twitterTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'twitter_title',
    },
    twitterDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'twitter_description',
    },
    twitterImageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'twitter_image_id',
    },
    focusKeyword: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'focus_keyword',
    },
  },
  {
    sequelize,
    modelName: 'BlogSeo',
    tableName: 'blog_seo',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['client_id', 'entity_type', 'entity_id'], // One SEO record per entity
      },
      {
        fields: ['entity_type', 'entity_id'], // Query by entity
      },
      {
        fields: ['focus_keyword'], // Query by keyword
      },
    ],
  }
);

export default BlogSeo;