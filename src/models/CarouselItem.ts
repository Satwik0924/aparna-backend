import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

interface CarouselItemAttributes {
  id: string;
  carouselId: string;
  title?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  linkTarget: '_self' | '_blank';
  buttonText?: string;
  buttonColor?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CarouselItemCreationAttributes extends Optional<CarouselItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CarouselItem extends Model<CarouselItemAttributes, CarouselItemCreationAttributes> implements CarouselItemAttributes {
  public id!: string;
  public carouselId!: string;
  public title?: string;
  public description?: string;
  public imageUrl!: string;
  public mobileImageUrl?: string;
  public linkUrl?: string;
  public linkTarget!: '_self' | '_blank';
  public buttonText?: string;
  public buttonColor?: string;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to check if item has a link
  public hasLink(): boolean {
    return this.linkUrl !== null && this.linkUrl !== undefined && this.linkUrl.trim() !== '';
  }

  // Helper method to check if item has a button
  public hasButton(): boolean {
    return this.buttonText !== null && this.buttonText !== undefined && this.buttonText.trim() !== '';
  }
}

CarouselItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    carouselId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'carousels',
        key: 'id',
      },
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
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'CarouselItem',
    tableName: 'carousel_items',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['carouselId'],
      },
      {
        fields: ['sortOrder'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default CarouselItem;