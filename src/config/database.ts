import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aparna_constructions',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql' as const,
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql' as const,
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};

export const spacesConfig = {
  accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
  region: process.env.AWS_S3_REGION || 'ap-south-1',
  bucket: process.env.AWS_S3_BUCKET || 'aparna-constructions-media',
  cdnEndpoint: process.env.AWS_CLOUDFRONT_DOMAIN || 'https://d2tdzhum1kggza.cloudfront.net'
};

export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  retryAttempts: 3,
  retryDelay: 1000
};