import { DataTypes, Model, Optional, Association } from 'sequelize';
import { sequelize } from '../utils/database';
import bcrypt from 'bcryptjs';
import Role from './Role';
import Client from './Client';

interface UserAttributes {
  id: string;
  clientId?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public clientId?: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public roleId!: string;
  public avatar?: string;
  public phone?: string;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public emailVerifiedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly role?: Role;
  public readonly client?: Client;

  public static associations: {
    role: Association<User, Role>;
    client: Association<User, Client>;
  };

  // Helper method to get full name
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Helper method to check password
  public async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Helper method to hash password
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Helper method to update last login
  public async updateLastLogin(): Promise<void> {
    this.lastLoginAt = new Date();
    await this.save();
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id',
      },
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['email'],
        unique: true,
      },
      {
        fields: ['clientId'],
      },
      {
        fields: ['roleId'],
      },
      {
        fields: ['isActive'],
      },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await user.hashPassword(user.password);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await user.hashPassword(user.password);
        }
      },
    },
  }
);

export default User;