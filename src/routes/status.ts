import { Router } from 'express';
import { sequelize } from '../utils/database';
import { redisClient } from '../utils/redis';
import fs from 'fs';
import path from 'path';

const router = Router();

// Project status endpoint
router.get('/', async (req, res) => {
  const status = {
    project: {
      name: 'Aparna Constructions CMS',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    services: {
      api: {
        status: 'running',
        port: process.env.PORT || 3001,
        httpsPort: process.env.HTTPS_PORT || 3443,
        baseUrl: `http://localhost:${process.env.PORT || 3001}`,
        httpsUrl: `https://localhost:${process.env.HTTPS_PORT || 3443}`
      },
      database: {
        status: 'unknown',
        type: 'MySQL',
        name: process.env.DB_NAME,
        host: process.env.DB_HOST
      },
      redis: {
        status: 'unknown',
        url: process.env.REDIS_URL
      },
      storage: {
        type: 'AWS S3 with CloudFront',
        configured: !!(process.env.AWS_S3_ACCESS_KEY && process.env.AWS_S3_SECRET_KEY)
      }
    },
    features: {
      implemented: [
        'Authentication System (JWT + X-API-Key)',
        'Client Management',
        'Property Management (Basic)',
        'Database Migrations',
        'HTTPS Support',
        'Error Handling',
        'Request Logging'
      ],
      inProgress: [
        'Property Images & Documents',
        'Content Management',
        'Media Library',
        'SEO Management'
      ],
      planned: [
        'FAQ Management',
        'Menu Builder',
        'Banner & Carousel',
        'Analytics Dashboard',
        'Swagger Documentation'
      ]
    },
    endpoints: {
      health: '/health',
      status: '/api/v1/status',
      auth: {
        login: 'POST /api/v1/auth/login',
        register: 'POST /api/v1/auth/register',
        profile: 'GET /api/v1/auth/profile'
      },
      clients: {
        list: 'GET /api/v1/clients',
        create: 'POST /api/v1/clients',
        get: 'GET /api/v1/clients/:id',
        update: 'PUT /api/v1/clients/:id',
        regenerateKey: 'POST /api/v1/clients/:id/regenerate-key'
      },
      properties: {
        list: 'GET /api/v1/properties',
        create: 'POST /api/v1/properties',
        get: 'GET /api/v1/properties/:id',
        update: 'PUT /api/v1/properties/:id',
        delete: 'DELETE /api/v1/properties/:id'
      }
    },
    certificates: {
      available: false,
      path: 'backend/certificates/'
    }
  };

  // Check database connection
  try {
    await sequelize.authenticate();
    status.services.database.status = 'connected';
  } catch (error) {
    status.services.database.status = 'disconnected';
  }

  // Check Redis connection
  try {
    await redisClient.ping();
    status.services.redis.status = 'connected';
  } catch (error) {
    status.services.redis.status = 'disconnected';
  }

  // Check SSL certificates
  const certPath = path.join(__dirname, '../../certificates/cert.pem');
  const keyPath = path.join(__dirname, '../../certificates/key.pem');
  status.certificates.available = fs.existsSync(certPath) && fs.existsSync(keyPath);

  res.json(status);
});

// Detailed system info
router.get('/system', async (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      },
      cpuUsage: process.cpuUsage(),
      uptime: `${Math.floor(process.uptime())} seconds`
    }
  });
});

export default router;