import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface SeoMetadataAttributes {
  id: string;
  entityType: 'property' | 'content' | 'page' | 'category' | 'tag';
  entityId?: string;
  pageType?: string;
  urlPath?: string;
  clientId: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  schemaMarkup?: object;
  canonicalUrl?: string;
  robots?: string;
  priority?: number;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface SeoMetadataCreationAttributes extends Optional<SeoMetadataAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class SeoMetadata extends Model<SeoMetadataAttributes, SeoMetadataCreationAttributes> implements SeoMetadataAttributes {
  public id!: string;
  public entityType!: 'property' | 'content' | 'page' | 'category' | 'tag';
  public entityId?: string;
  public pageType?: string;
  public urlPath?: string;
  public clientId!: string;
  public metaTitle?: string;
  public metaDescription?: string;
  public metaKeywords?: string;
  public ogTitle?: string;
  public ogDescription?: string;
  public ogImage?: string;
  public ogUrl?: string;
  public ogType?: string;
  public twitterTitle?: string;
  public twitterDescription?: string;
  public twitterImage?: string;
  public twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  public schemaMarkup?: object;
  public canonicalUrl?: string;
  public robots?: string;
  public priority?: number;
  public changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  public isActive?: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Helper method to get effective meta title
  public getEffectiveMetaTitle(): string {
    return this.metaTitle || this.ogTitle || '';
  }

  // Helper method to get effective meta description
  public getEffectiveMetaDescription(): string {
    return this.metaDescription || this.ogDescription || '';
  }

  // Helper method to get effective title for Twitter
  public getEffectiveTwitterTitle(): string {
    return this.twitterTitle || this.metaTitle || this.ogTitle || '';
  }

  // Helper method to get effective description for Twitter
  public getEffectiveTwitterDescription(): string {
    return this.twitterDescription || this.metaDescription || this.ogDescription || '';
  }

  // Helper method to get effective image for Twitter
  public getEffectiveTwitterImage(): string {
    return this.twitterImage || this.ogImage || '';
  }

  // Helper method to check if schema markup exists
  public hasSchemaMarkup(): boolean {
    return this.schemaMarkup !== null && 
           this.schemaMarkup !== undefined && 
           Object.keys(this.schemaMarkup as object).length > 0;
  }

  // Helper method to get robots directive
  public getRobotsDirective(): string {
    return this.robots || 'index, follow';
  }
}

SeoMetadata.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    entityType: {
      type: DataTypes.ENUM('property', 'content', 'page', 'category', 'tag'),
      allowNull: false,
      field: 'entity_type'
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'entity_id'
    },
    pageType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'page_type'
    },
    urlPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'url_path'
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
    metaTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'meta_title'
    },
    metaDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'meta_description'
    },
    metaKeywords: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'meta_keywords'
    },
    ogTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'og_title'
    },
    ogDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'og_description'
    },
    ogImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'og_image'
    },
    ogUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'og_url'
    },
    ogType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'website',
      field: 'og_type'
    },
    twitterTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'twitter_title'
    },
    twitterDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'twitter_description'
    },
    twitterImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'twitter_image'
    },
    twitterCard: {
      type: DataTypes.ENUM('summary', 'summary_large_image', 'app', 'player'),
      allowNull: true,
      defaultValue: 'summary_large_image',
      field: 'twitter_card'
    },
    schemaMarkup: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'schema_markup'
    },
    canonicalUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'canonical_url'
    },
    robots: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'index, follow',
    },
    priority: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
      defaultValue: 0.5
    },
    changeFrequency: {
      type: DataTypes.ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'),
      allowNull: true,
      defaultValue: 'monthly',
      field: 'change_frequency'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    sequelize,
    modelName: 'SeoMetadata',
    tableName: 'seo_metadata',
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
        fields: ['entity_type', 'entity_id'],
      },
      {
        fields: ['entity_type'],
      },
      {
        fields: ['page_type'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['url_path', 'client_id'],
        unique: true,
      },
    ],
  }
);

export default SeoMetadata;