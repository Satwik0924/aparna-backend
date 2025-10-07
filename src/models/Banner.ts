import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface BannerAttributes {
  id: string;
  clientId: string;
  name: string;
  type: 'hero' | 'promotional' | 'sidebar' | 'popup' | 'custom';
  title?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkTarget: '_self' | '_blank';
  buttonText?: string;
  buttonColor?: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  sortOrder: number;
  impressions: number;
  clicks: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BannerCreationAttributes extends Optional<BannerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Banner extends Model<BannerAttributes, BannerCreationAttributes> implements BannerAttributes {
  public id!: string;
  public clientId!: string;
  public name!: string;
  public type!: 'hero' | 'promotional' | 'sidebar' | 'popup' | 'custom';
  public title?: string;
  public description?: string;
  public imageUrl!: string;
  public mobileImageUrl?: string;
  public linkUrl?: string;
  public linkTarget!: '_self' | '_blank';
  public buttonText?: string;
  public buttonColor?: string;
  public isActive!: boolean;
  public startDate?: Date;
  public endDate?: Date;
  public sortOrder!: number;
  public impressions!: number;
  public clicks!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to check if banner is currently active
  public isCurrentlyActive(): boolean {
    if (!this.isActive) return false;
    
    const now = new Date();
    
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    
    return true;
  }

  // Helper method to increment impressions
  public async incrementImpressions(): Promise<void> {
    await this.increment('impressions');
  }

  // Helper method to increment clicks
  public async incrementClicks(): Promise<void> {
    await this.increment('clicks');
  }

  // Helper method to get click-through rate
  public getClickThroughRate(): number {
    if (this.impressions === 0) return 0;
    return (this.clicks / this.impressions) * 100;
  }
}

Banner.init(
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
    type: {
      type: DataTypes.ENUM('hero', 'promotional', 'sidebar', 'popup', 'custom'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mobileImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    linkUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    linkTarget: {
      type: DataTypes.ENUM('_self', '_blank'),
      defaultValue: '_self',
    },
    buttonText: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    buttonColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    impressions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Banner',
    tableName: 'banners',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['clientId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['startDate', 'endDate'],
      },
      {
        fields: ['sortOrder'],
      },
    ],
  }
);

export default Banner;