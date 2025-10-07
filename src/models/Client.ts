import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

interface ClientAttributes {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  apiKey: string;
  apiKeyStatus: 'active' | 'suspended' | 'expired';
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  monthlyRequests: number;
  monthlyRequestsLimit: number;
  bandwidthUsage: number;
  bandwidthLimit: number;
  isActive: boolean;
  subscriptionExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClientCreationAttributes extends Optional<ClientAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  declare id: string;
  declare companyName: string;
  declare contactEmail: string;
  declare contactPhone?: string;
  declare website?: string;
  declare address?: string;
  declare city?: string;
  declare state?: string;
  declare country?: string;
  declare postalCode?: string;
  declare apiKey: string;
  declare apiKeyStatus: 'active' | 'suspended' | 'expired';
  declare subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  declare monthlyRequests: number;
  declare monthlyRequestsLimit: number;
  declare bandwidthUsage: number;
  declare bandwidthLimit: number;
  declare isActive: boolean;
  declare subscriptionExpiresAt?: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Helper method to generate API key
  static generateApiKey(): string {
    return `ak_live_${uuidv4().replace(/-/g, '').substring(0, 32)}`;
  }

  // Helper method to check if subscription is active
  public isSubscriptionActive(): boolean {
    if (!this.subscriptionExpiresAt) return true;
    return this.subscriptionExpiresAt > new Date();
  }

  // Helper method to check API limits
  public canMakeRequest(): boolean {
    return this.monthlyRequests < this.monthlyRequestsLimit && this.isActive && this.apiKeyStatus === 'active';
  }
}

Client.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'company_name',
      validate: {
        len: [2, 255],
      },
    },
    contactEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'contact_email',
      validate: {
        isEmail: true,
      },
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'contact_phone',
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'postal_code',
    },
    apiKey: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      field: 'api_key',
      defaultValue: () => Client.generateApiKey(),
    },
    apiKeyStatus: {
      type: DataTypes.ENUM('active', 'suspended', 'expired'),
      defaultValue: 'active',
      field: 'api_key_status',
    },
    subscriptionPlan: {
      type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
      defaultValue: 'basic',
      field: 'subscription_plan',
    },
    monthlyRequests: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'monthly_requests',
    },
    monthlyRequestsLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
      field: 'monthly_requests_limit',
    },
    bandwidthUsage: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      field: 'bandwidth_usage',
    },
    bandwidthLimit: {
      type: DataTypes.BIGINT,
      defaultValue: 1073741824, // 1GB in bytes
      field: 'bandwidth_limit',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    subscriptionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_expires_at',
    },
  },
  {
    sequelize,
    modelName: 'Client',
    tableName: 'clients',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['apiKey'],
        unique: true,
      },
      {
        fields: ['contactEmail'],
        unique: true,
      },
      {
        fields: ['subscriptionPlan'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default Client;