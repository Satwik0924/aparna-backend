import { createClient } from 'redis';
import { redisConfig } from '../config/database';

export const redisClient = createClient({
  url: redisConfig.url,
  password: redisConfig.password,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > redisConfig.retryAttempts) {
        return new Error('Redis connection failed');
      }
      return Math.min(retries * redisConfig.retryDelay, 5000);
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

// Initialize Redis connection
redisClient.connect().catch(console.error);

export default redisClient;