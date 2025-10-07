import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../utils/database';
import slugify from 'slugify';

interface ProjectCarouselAttributes {
  id: string;
  clientId: string;
  name: string;
  slug: string;
  description?: string;
  cityId?: string;
  areaId?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectCarouselCreationAttributes extends Optional<ProjectCarouselAttributes, 'id' | 'slug' | 'displayOrder' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class ProjectCarousel extends Model<ProjectCarouselAttributes, ProjectCarouselCreationAttributes> implements ProjectCarouselAttributes {
  public id!: string;
  public clientId!: string;
  public name!: string;
  public slug!: string;
  public description?: string;
  public cityId?: string;
  public areaId?: string;
  public displayOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public items?: any[];
  public properties?: any[];
  public city?: any;
  public area?: any;

  // Helper method to generate unique slug
  static async generateSlug(name: string, clientId: string, id?: string): Promise<string> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingCarousel = await ProjectCarousel.findOne({
        where: {
          slug,
          clientId,
          ...(id && { id: { [Op.ne]: id } })
        }
      });

      if (!existingCarousel) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

ProjectCarousel.init(
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
    cityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'city_id',
      references: {
        model: 'dropdown_values',
        key: 'id',
      },
    },
    areaId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'area_id',
      references: {
        model: 'dropdown_values',
        key: 'id',
      },
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'display_order',
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
    modelName: 'ProjectCarousel',
    tableName: 'project_carousels',
    timestamps: true,
    paranoid: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['client_id', 'slug'],
      },
      {
        fields: ['client_id'],
      },
      {
        fields: ['slug'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['display_order'],
      },
    ],
    hooks: {
      beforeValidate: async (carousel: ProjectCarousel) => {
        if (carousel.name && (!carousel.slug || carousel.changed('name'))) {
          carousel.slug = await ProjectCarousel.generateSlug(carousel.name, carousel.clientId, carousel.id);
        }
      },
    },
  }
);

export default ProjectCarousel;