import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../utils/database';
import slugify from 'slugify';

interface PropertyAttributes {
  id: string;
  clientId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  priceType: 'fixed' | 'negotiable' | 'on_request';
  currency: string;
  propertyTypeId?: string;
  statusId?: string;
  cityId?: string;
  areaId?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  areaUnit: 'sq_ft' | 'sq_m' | 'acres' | 'hectares';
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  parkingSpaces?: number;
  builtYear?: number;
  reraNumber?: string;
  buildingPermissionNumber?: string;
  reraWebsite?: string;
  basicSectionData?: {
    sectionTitle?: string;
    sectionTexts?: string[];
  };
  basicDynamicFields?: Array<{
    key: string;
    value: string;
    id?: string;
  }>;
  highlightsSectionData?: {
    sectionTitle?: string;
    sectionTexts?: string[];
  };
  highlightsDynamicFields?: Array<{
    key: string;
    value: string;
    id?: string;
  }>;
  featured: boolean;
  isActive: boolean;
  viewCount: number;
  inquiryCount: number;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishedAt?: Date;
  // Banner fields
  bannerDesktopUrl?: string;
  bannerMobileUrl?: string;
  bannerDesktopAlt?: string;
  bannerMobileAlt?: string;
  bannerDesktopTitle?: string;
  bannerDesktopDescription?: string;
  bannerMobileTitle?: string;
  bannerMobileDescription?: string;
  bannerLinkUrl?: string;
  bannerLinkText?: string;
  // Logo fields
  logoUrl?: string;
  logoAlt?: string;
  logoTitle?: string;
  logoDescription?: string;
  // Video banner fields
  videoBannerUrl?: string;
  videoBannerTitle?: string;
  videoBannerDescription?: string;
  // Videos fields  
  videos?: Array<{
    id?: string;
    url: string;
    title: string;
  }>;
  // CRM Integration fields
  sellDoProjectId?: string;
  
  // Associations
  amenitiesHighlights?: any[];
  floorPlans?: any[];
  layouts?: any[];
  locationHighlights?: any[];
  overviewHighlights?: any[];
  videoTestimonials?: any[];
  images?: any[];
  bannerCarouselDesktop?: any[];
  bannerCarouselMobile?: any[];
  gallery?: any[];
  
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface PropertyCreationAttributes extends Optional<PropertyAttributes, 'id' | 'slug' | 'createdAt' | 'updatedAt'> {}

class Property extends Model<PropertyAttributes, PropertyCreationAttributes> implements PropertyAttributes {
  public id!: string;
  public clientId!: string;
  public name!: string;
  public slug!: string;
  public description?: string;
  public shortDescription?: string;
  public price?: number;
  public priceType!: 'fixed' | 'negotiable' | 'on_request';
  public currency!: string;
  public propertyTypeId?: string;
  public statusId?: string;
  public cityId?: string;
  public areaId?: string;
  public address?: string;
  public city?: string;
  public state?: string;
  public country?: string;
  public postalCode?: string;
  public latitude?: number;
  public longitude?: number;
  public area?: number;
  public areaUnit!: 'sq_ft' | 'sq_m' | 'acres' | 'hectares';
  public bedrooms?: number;
  public bathrooms?: number;
  public floors?: number;
  public parkingSpaces?: number;
  public builtYear?: number;
  public reraNumber?: string;
  public buildingPermissionNumber?: string;
  public reraWebsite?: string;
  public basicSectionData?: {
    sectionTitle?: string;
    sectionTexts?: string[];
  };
  public basicDynamicFields?: Array<{
    key: string;
    value: string;
    id?: string;
  }>;
  public highlightsSectionData?: {
    sectionTitle?: string;
    sectionTexts?: string[];
  };
  public highlightsDynamicFields?: Array<{
    key: string;
    value: string;
    id?: string;
  }>;
  public featured!: boolean;
  public isActive!: boolean;
  public viewCount!: number;
  public inquiryCount!: number;
  public sortOrder?: number;
  public seoTitle?: string;
  public seoDescription?: string;
  public seoKeywords?: string;
  public publishedAt?: Date;
  // Banner fields
  public bannerDesktopUrl?: string;
  public bannerMobileUrl?: string;
  public bannerDesktopAlt?: string;
  public bannerMobileAlt?: string;
  public bannerDesktopTitle?: string;
  public bannerDesktopDescription?: string;
  public bannerMobileTitle?: string;
  public bannerMobileDescription?: string;
  public bannerLinkUrl?: string;
  public bannerLinkText?: string;
  // Logo fields
  public logoUrl?: string;
  public logoAlt?: string;
  public logoTitle?: string;
  public logoDescription?: string;
  // Video banner fields
  public videoBannerUrl?: string;
  public videoBannerTitle?: string;
  public videoBannerDescription?: string;
  // Videos fields
  public videos?: Array<{
    id?: string;
    url: string;
    title: string;
  }>;
  // CRM Integration fields
  public sellDoProjectId?: string;
  
  // Associations
  public amenitiesHighlights?: any[];
  public floorPlans?: any[];
  public layouts?: any[];
  public locationHighlights?: any[];
  public overviewHighlights?: any[];
  public videoTestimonials?: any[];
  public images?: any[];
  public bannerCarouselDesktop?: any[];
  public bannerCarouselMobile?: any[];
  public gallery?: any[];
  public propertyType?: any;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Helper method to generate unique slug
  static async generateSlug(name: string, clientId: string, id?: string): Promise<string> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingProperty = await Property.findOne({
        where: {
          slug,
          clientId,
          ...(id && { id: { [Op.ne]: id } })
        }
      });

      if (!existingProperty) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Helper method to get formatted price
  public getFormattedPrice(): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    });
    return formatter.format(this.price || 0);
  }

  // Helper method to increment view count
  public async incrementViewCount(): Promise<void> {
    await this.increment('viewCount');
  }

  // Helper method to increment inquiry count
  public async incrementInquiryCount(): Promise<void> {
    await this.increment('inquiryCount');
  }
}

Property.init(
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
        len: [2, 255],
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
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'short_description',
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    priceType: {
      type: DataTypes.ENUM('fixed', 'negotiable', 'on_request'),
      defaultValue: 'fixed',
      field: 'price_type',
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    propertyTypeId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'property_type_id',
    },
    statusId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'status_id',
    },
    cityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'city_id',
    },
    areaId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'area_id',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: '',
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: '',
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: '',
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'postal_code',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    areaUnit: {
      type: DataTypes.ENUM('sq_ft', 'sq_m', 'acres', 'hectares'),
      defaultValue: 'sq_ft',
      field: 'area_unit',
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    floors: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
    },
    parkingSpaces: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parking_spaces',
      validate: {
        min: 0,
      },
    },
    builtYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'built_year',
      validate: {
        min: 1800,
        max: new Date().getFullYear() + 5,
      },
    },
    reraNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'rera_number',
    },
    buildingPermissionNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'building_permission_number',
    },
    reraWebsite: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rera_website',
    },
    basicSectionData: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'basic_section_data',
    },
    basicDynamicFields: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'basic_dynamic_fields',
    },
    highlightsSectionData: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'highlights_section_data',
    },
    highlightsDynamicFields: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'highlights_dynamic_fields',
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count',
    },
    inquiryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'inquiry_count',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sort_order',
    },
    seoTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'seo_title',
    },
    seoDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'seo_description',
    },
    seoKeywords: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'seo_keywords',
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at',
    },
    // Banner fields
    bannerDesktopUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'banner_desktop_url',
    },
    bannerMobileUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'banner_mobile_url',
    },
    bannerDesktopAlt: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'banner_desktop_alt',
    },
    bannerMobileAlt: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'banner_mobile_alt',
    },
    bannerDesktopTitle: {
      type: DataTypes.STRING(255),  
      allowNull: true,
      field: 'banner_desktop_title',
    },
    bannerDesktopDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'banner_desktop_description',
    },
    bannerMobileTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'banner_mobile_title',
    },
    bannerMobileDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'banner_mobile_description',
    },
    bannerLinkUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'banner_link_url',
    },
    bannerLinkText: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'banner_link_text',
    },
    // Logo fields
    logoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'logo_url',
    },
    logoAlt: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'logo_alt',
    },
    logoTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'logo_title',
    },
    logoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'logo_description',
    },
    videoBannerUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'video_banner_url',
      validate: {
        isUrl: true
      }
    },
    videoBannerTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'video_banner_title',
    },
    videoBannerDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'video_banner_description',
    },
    videos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    sellDoProjectId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'selldo_project_id',
    },
  },
  {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['clientId'],
      },
      {
        fields: ['slug', 'clientId'],
        unique: true,
      },
      {
        fields: ['propertyTypeId'],
      },
      {
        fields: ['statusId'],
      },
      {
        fields: ['city'],
      },
      {
        fields: ['state'],
      },
      {
        fields: ['country'],
      },
      {
        fields: ['price'],
      },
      {
        fields: ['featured'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['publishedAt'],
      },
      {
        fields: ['sortOrder'],
      },
    ],
    hooks: {
      beforeCreate: async (property: Property) => {
        if (!property.slug) {
          property.slug = await Property.generateSlug(property.name, property.clientId);
        }
      },
      beforeUpdate: async (property: Property) => {
        if (property.changed('name')) {
          property.slug = await Property.generateSlug(property.name, property.clientId, property.id);
        }
      },
    },
  }
);

export default Property;