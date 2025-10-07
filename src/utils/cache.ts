import redisClient from './redis';

export class CacheService {
  private static isProductionOrServer(): boolean {
    return process.env.NODE_ENV === 'production' || process.env.REDIS_ENABLED === 'true';
  }

  static async get(key: string): Promise<any> {
    if (!this.isProductionOrServer()) {
      return null; // Skip cache in local development
    }

    try {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.isProductionOrServer()) {
      return; // Skip cache in local development
    }

    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async del(key: string): Promise<void> {
    if (!this.isProductionOrServer()) {
      return; // Skip cache in local development
    }

    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    if (!this.isProductionOrServer()) {
      return; // Skip cache in local development
    }

    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Property-specific cache methods
  static propertyKey(slug: string, clientId: string): string {
    return `property:${clientId}:${slug}`;
  }

  static propertyGalleryKey(slug: string, clientId: string): string {
    return `property:${clientId}:${slug}:gallery`;
  }

  static propertyVideosKey(slug: string, clientId: string): string {
    return `property:${clientId}:${slug}:videos`;
  }

  static propertyTestimonialsKey(slug: string, clientId: string): string {
    return `property:${clientId}:${slug}:testimonials`;
  }

  static propertyLayoutsKey(slug: string, clientId: string): string {
    return `property:${clientId}:${slug}:layouts`;
  }

  static propertyFloorPlansKey(slug: string, clientId: string): string {
    return `property:${clientId}:${slug}:floor-plans`;
  }

  static propertyAmenitiesKey(slug: string, clientId: string): string {
    return `property:${clientId}:${slug}:amenities`;
  }

  // Cache invalidation for property updates
  static async invalidateProperty(slug: string, clientId: string): Promise<void> {
    await Promise.all([
      this.del(this.propertyKey(slug, clientId)),
      this.del(this.propertyGalleryKey(slug, clientId)),
      this.del(this.propertyVideosKey(slug, clientId)),
      this.del(this.propertyTestimonialsKey(slug, clientId)),
      this.del(this.propertyLayoutsKey(slug, clientId)),
      this.del(this.propertyFloorPlansKey(slug, clientId)),
      this.del(this.propertyAmenitiesKey(slug, clientId))
    ]);
  }
}

export default CacheService;