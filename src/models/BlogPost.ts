import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';
import Client from './Client';
import User from './User';
import BlogMedia from './BlogMedia';
import BlogCategory from './BlogCategory';
import BlogTag from './BlogTag';
import BlogVideo from './BlogVideo';

// Define the attributes interface
interface BlogPostAttributes {
  id: number;
  uuid: string;
  clientId: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  isIndexable: boolean;
  authorId?: string;
  featuredImageId?: number;
  publishedAt?: Date | null;
  authorData?: string; // Added author_data field as simple text
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes (optional fields during creation)
interface BlogPostCreationAttributes extends Optional<BlogPostAttributes, 'id' | 'uuid' | 'status' | 'isIndexable' | 'createdAt' | 'updatedAt'> {}

// Define the model class
class BlogPost extends Model<BlogPostAttributes, BlogPostCreationAttributes> implements BlogPostAttributes {
  public id!: number;
  public uuid!: string;
  public clientId!: string;
  public title!: string;
  public slug!: string;
  public content?: string;
  public excerpt?: string;
  public status!: 'draft' | 'published' | 'archived';
  public isIndexable!: boolean;
  public authorId?: string;
  public featuredImageId?: number;
  public publishedAt?: Date | null;
  public authorData?: string; // Added author_data property as simple text
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods (will be added by Sequelize)
  public getClient!: () => Promise<Client>;
  public setClient!: (client: Client) => Promise<void>;
  public getAuthor!: () => Promise<User>;
  public setAuthor!: (user: User) => Promise<void>;
  public getFeaturedImage!: () => Promise<BlogMedia>;
  public setFeaturedImage!: (media: BlogMedia) => Promise<void>;
  
  // Many-to-many associations (will be added by Sequelize)
  public getCategories!: () => Promise<BlogCategory[]>;
  public setCategories!: (categories: BlogCategory[]) => Promise<void>;
  public addCategory!: (category: BlogCategory) => Promise<void>;
  public removeCategory!: (category: BlogCategory) => Promise<void>;
  
  public getTags!: () => Promise<BlogTag[]>;
  public setTags!: (tags: BlogTag[]) => Promise<void>;
  public addTag!: (tag: BlogTag) => Promise<void>;
  public removeTag!: (tag: BlogTag) => Promise<void>;
  
  public getVideos!: () => Promise<BlogVideo[]>;
  public setVideos!: (videos: BlogVideo[]) => Promise<void>;
  public addVideo!: (video: BlogVideo) => Promise<void>;
  public removeVideo!: (video: BlogVideo) => Promise<void>;

  // Helper methods
  public isPublished(): boolean {
    return this.status === 'published' && !!this.publishedAt;
  }

  public isDraft(): boolean {
    return this.status === 'draft';
  }

  public isArchived(): boolean {
    return this.status === 'archived';
  }

  public canBePublished(): boolean {
    return !!(this.title && this.content && this.slug);
  }

  public getExcerptOrGenerated(maxLength: number = 160): string {
    if (this.excerpt) {
      return this.excerpt;
    }
    
    if (this.content) {
      // Strip HTML tags and get first N characters
      const plainText = this.content.replace(/<[^>]*>/g, '');
      return plainText.length > maxLength 
        ? plainText.substring(0, maxLength) + '...'
        : plainText;
    }
    
    return '';
  }

  public getReadingTime(): number {
    if (!this.content) return 0;
    
    const wordsPerMinute = 200;
    const plainText = this.content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  public getFullUrl(baseUrl: string): string {
    return `${baseUrl}/blog/${this.slug}`;
  }

  public async publish(): Promise<void> {
    if (!this.canBePublished()) {
      throw new Error('Post cannot be published: missing required fields');
    }
    
    await this.update({
      status: 'published',
      publishedAt: new Date(),
    });
  }

  public async unpublish(): Promise<void> {
    await this.update({
      status: 'draft',
      publishedAt: null,
    } as any);
  }

  public async archive(): Promise<void> {
    await this.update({
      status: 'archived',
    });
  }

  // Word count for content
  public getWordCount(): number {
    if (!this.content) return 0;
    const plainText = this.content.replace(/<[^>]*>/g, '');
    return plainText.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Check if post has featured image
  public hasFeaturedImage(): boolean {
    return !!this.featuredImageId;
  }
}

// Initialize the model
BlogPost.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'client_id',
      references: {
        model: Client,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // URL-friendly slug pattern
      },
    },
    content: {
      type: DataTypes.TEXT('long'), // Support large content
      allowNull: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 300], // Keep excerpts concise
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
      allowNull: false,
    },
    isIndexable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_indexable',
    },
    authorId: {
     type: DataTypes.UUID,
      allowNull: true,
      field: 'author_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    featuredImageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'featured_image_id',
      references: {
        model: BlogMedia,
        key: 'id',
      },
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at',
    },
    // NEW: Added author_data field
    authorData: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'author_data', // Maps to author_data column in database
    },
  },
  {
    sequelize,
    modelName: 'BlogPost',
    tableName: 'blog_posts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['client_id', 'slug'], // Ensure slug is unique per client
      },
      {
        fields: ['client_id', 'status'], // Query published posts
      },
      {
        fields: ['author_id'], // Query by author
      },
      {
        fields: ['published_at'], // Sort by publication date
      },
      {
        fields: ['status', 'published_at'], // Query published posts by date
      },
    ],
    hooks: {
      beforeUpdate: (post) => {
        // Auto-set publishedAt when status changes to published
        if (post.changed('status') && post.status === 'published' && !post.publishedAt) {
          post.publishedAt = new Date();
        }
        // Clear publishedAt when status changes from published
        if (post.changed('status') && post.status !== 'published') {
          post.publishedAt = null;
        }
      },
    },
  }
);

export default BlogPost;