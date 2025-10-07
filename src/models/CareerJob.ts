import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../utils/database';
import slugify from 'slugify';

interface CareerJobAttributes {
  id: string;
  clientId: string;
  title: string;
  slug: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  departmentId?: string;
  jobTypeId?: string;
  cityId?: string;
  areaId?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  isActive: boolean;
  isFeatured: boolean;
  postedDate: Date;
  closingDate?: Date;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface CareerJobCreationAttributes extends Optional<
  CareerJobAttributes,
  'id' | 'slug' | 'isActive' | 'isFeatured' | 'postedDate' | 'createdAt' | 'updatedAt'
> {}

class CareerJob extends Model<CareerJobAttributes, CareerJobCreationAttributes> implements CareerJobAttributes {
  public id!: string;
  public clientId!: string;
  public title!: string;
  public slug!: string;
  public description?: string;
  public requirements?: string[];
  public responsibilities?: string[];
  public departmentId?: string;
  public jobTypeId?: string;
  public cityId?: string;
  public areaId?: string;
  public experienceMin?: number;
  public experienceMax?: number;
  public salaryMin?: number;
  public salaryMax?: number;
  public isActive!: boolean;
  public isFeatured!: boolean;
  public postedDate!: Date;
  public closingDate?: Date;
  public sortOrder?: number;

  // Associations
  public department?: any;
  public jobType?: any;
  public cityDropdown?: any;
  public areaDropdown?: any;
  public client?: any;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Helper method to generate unique slug
  static async generateSlug(title: string, clientId: string, id?: string): Promise<string> {
    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingJob = await CareerJob.findOne({
        where: {
          slug,
          clientId,
          ...(id && { id: { [Op.ne]: id } })
        }
      });

      if (!existingJob) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Helper method to check if job is expired
  public isExpired(): boolean {
    if (!this.closingDate) return false;
    return new Date() > new Date(this.closingDate);
  }

  // Helper method to format experience range
  public getExperienceRange(): string {
    if (!this.experienceMin && !this.experienceMax) return 'Not specified';
    if (this.experienceMin === 0 && !this.experienceMax) return 'Fresher';
    if (this.experienceMin === this.experienceMax) return `${this.experienceMin} years`;
    if (!this.experienceMax) return `${this.experienceMin}+ years`;
    return `${this.experienceMin || 0} - ${this.experienceMax} years`;
  }

  // Helper method to format salary range
  public getSalaryRange(): string {
    if (!this.salaryMin && !this.salaryMax) return 'Not disclosed';
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    if (this.salaryMin && this.salaryMax && this.salaryMin === this.salaryMax) return formatter.format(this.salaryMin);
    if (this.salaryMin && !this.salaryMax) return `${formatter.format(this.salaryMin)}+`;
    return `${formatter.format(this.salaryMin || 0)} - ${formatter.format(this.salaryMax || 0)}`;
  }
}

CareerJob.init(
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
    title: {
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
    requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    responsibilities: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'department_id',
    },
    jobTypeId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'job_type_id',
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
    experienceMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'experience_min',
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    experienceMax: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'experience_max',
      validate: {
        min: 0,
      },
    },
    salaryMin: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'salary_min',
    },
    salaryMax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'salary_max',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured',
    },
    postedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'posted_date',
    },
    closingDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'closing_date',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
  },
  {
    sequelize,
    modelName: 'CareerJob',
    tableName: 'careers_jobs',
    timestamps: true,
    paranoid: true,
    underscored: true,
    hooks: {
      beforeValidate: async (job: CareerJob) => {
        if (job.title && (!job.slug || job.changed('title'))) {
          job.slug = await CareerJob.generateSlug(job.title, job.clientId, job.id);
        }
      },
    },
  }
);

export default CareerJob;