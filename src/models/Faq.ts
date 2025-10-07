import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface FaqAttributes {
  id: string;
  clientId: string;
  categoryId: string;
  propertyId?: string;
  question: string;
  answer: string;
  isPublished: boolean;
  sortOrder: number;
  viewCount: number;
  isHelpful: number;
  isNotHelpful: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FaqCreationAttributes extends Optional<FaqAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Faq extends Model<FaqAttributes, FaqCreationAttributes> implements FaqAttributes {
  public id!: string;
  public clientId!: string;
  public categoryId!: string;
  public propertyId?: string;
  public question!: string;
  public answer!: string;
  public isPublished!: boolean;
  public sortOrder!: number;
  public viewCount!: number;
  public isHelpful!: number;
  public isNotHelpful!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to increment view count
  public async incrementViewCount(): Promise<void> {
    await this.increment('viewCount');
  }

  // Helper method to mark as helpful
  public async markHelpful(): Promise<void> {
    await this.increment('isHelpful');
  }

  // Helper method to mark as not helpful
  public async markNotHelpful(): Promise<void> {
    await this.increment('isNotHelpful');
  }

  // Helper method to get helpfulness score
  public getHelpfulnessScore(): number {
    const total = this.isHelpful + this.isNotHelpful;
    if (total === 0) return 0;
    return (this.isHelpful / total) * 100;
  }

  // Helper method to check if FAQ is global
  public isGlobal(): boolean {
    return this.propertyId === null || this.propertyId === undefined;
  }

  // Helper method to check if FAQ is property-specific
  public isPropertySpecific(): boolean {
    return this.propertyId !== null && this.propertyId !== undefined;
  }
}

Faq.init(
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
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'faq_categories',
        key: 'id',
      },
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'property_id',
      references: {
        model: 'properties',
        key: 'id',
      },
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000],
      },
    },
    answer: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      validate: {
        len: [10, 10000],
      },
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_published',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count',
    },
    isHelpful: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'is_helpful',
    },
    isNotHelpful: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'is_not_helpful',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'Faq',
    tableName: 'faqs',
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
        fields: ['category_id'],
      },
      {
        fields: ['property_id'],
      },
      {
        fields: ['is_published'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['sort_order'],
      },
    ],
  }
);

export default Faq;