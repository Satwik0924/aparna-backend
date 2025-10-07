import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface ProjectCarouselItemAttributes {
  id: string;
  carouselId: string;
  propertyId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectCarouselItemCreationAttributes extends Optional<ProjectCarouselItemAttributes, 'id' | 'sortOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class ProjectCarouselItem extends Model<ProjectCarouselItemAttributes, ProjectCarouselItemCreationAttributes> implements ProjectCarouselItemAttributes {
  public id!: string;
  public carouselId!: string;
  public propertyId!: string;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public carousel?: any;
  public property?: any;
}

ProjectCarouselItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    carouselId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'carousel_id',
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'property_id',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'sort_order',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'ProjectCarouselItem',
    tableName: 'project_carousel_items',
    timestamps: true,
    paranoid: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['carousel_id', 'property_id'],
      },
      {
        fields: ['carousel_id'],
      },
      {
        fields: ['property_id'],
      },
      {
        fields: ['sort_order'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

export default ProjectCarouselItem;