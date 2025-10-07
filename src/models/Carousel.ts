import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface CarouselAttributes {
  id: string;
  clientId: string;
  name: string;
  type: 'property' | 'testimonial' | 'banner' | 'gallery' | 'custom';
  settings: object;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CarouselCreationAttributes extends Optional<CarouselAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Carousel extends Model<CarouselAttributes, CarouselCreationAttributes> implements CarouselAttributes {
  public id!: string;
  public clientId!: string;
  public name!: string;
  public type!: 'property' | 'testimonial' | 'banner' | 'gallery' | 'custom';
  public settings!: object;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to get carousel settings
  public getSettings(): any {
    return this.settings as any;
  }

  // Helper method to update carousel settings
  public async updateSettings(newSettings: object): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.save();
  }
}

Carousel.init(
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
      type: DataTypes.ENUM('property', 'testimonial', 'banner', 'gallery', 'custom'),
      allowNull: false,
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        autoplay: true,
        autoplaySpeed: 5000,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        dots: true,
        arrows: true,
        fade: false,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Carousel',
    tableName: 'carousels',
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
    ],
  }
);

export default Carousel;