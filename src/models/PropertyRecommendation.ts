import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface PropertyRecommendationAttributes {
  id: string;
  propertyId: string;
  recommendedPropertyId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PropertyRecommendationCreationAttributes 
  extends Optional<PropertyRecommendationAttributes, 'id' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class PropertyRecommendation extends Model<PropertyRecommendationAttributes, PropertyRecommendationCreationAttributes>
  implements PropertyRecommendationAttributes {
  public id!: string;
  public propertyId!: string;
  public recommendedPropertyId!: string;
  public sortOrder!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PropertyRecommendation.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'property_id'
    },
    recommendedPropertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'recommended_property_id'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'property_recommendations',
    modelName: 'PropertyRecommendation',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['property_id']
      },
      {
        fields: ['recommended_property_id']
      },
      {
        fields: ['property_id', 'sort_order']
      },
      {
        unique: true,
        fields: ['property_id', 'recommended_property_id']
      }
    ]
  }
);

export default PropertyRecommendation;