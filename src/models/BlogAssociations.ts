// Blog Models Associations
// This file defines all the relationships between blog models
// Import this after all blog models are defined

import { Op } from 'sequelize';
import { sequelize } from '../utils/database';
import Client from './Client';
import User from './User';
import BlogCategory from './BlogCategory';
import BlogTag from './BlogTag';
import BlogVideo from './BlogVideo';
import BlogMedia from './BlogMedia';
import BlogSeo from './BlogSeo';
import BlogPost from './BlogPost';
import BlogPostCategory from './BlogPostCategory';
import BlogPostTag from './BlogPostTag';
import BlogPostVideo from './BlogPostVideo';

export const initializeBlogAssociations = () => {
  // ====== BASIC ASSOCIATIONS ======
  
  // Client associations
  Client.hasMany(BlogCategory, { foreignKey: 'clientId', as: 'blogCategories' });
  Client.hasMany(BlogTag, { foreignKey: 'clientId', as: 'blogTags' });
  Client.hasMany(BlogVideo, { foreignKey: 'clientId', as: 'blogVideos' });
  Client.hasMany(BlogMedia, { foreignKey: 'clientId', as: 'blogMedia' });
  Client.hasMany(BlogSeo, { foreignKey: 'clientId', as: 'blogSeo' });
  Client.hasMany(BlogPost, { foreignKey: 'clientId', as: 'blogPosts' });

  // Blog model -> Client associations
  BlogCategory.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  BlogTag.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  BlogVideo.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  BlogMedia.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  BlogSeo.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  BlogPost.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

  // User associations
  User.hasMany(BlogPost, { foreignKey: 'authorId', as: 'blogPosts' });
  User.hasMany(BlogMedia, { foreignKey: 'uploadedBy', as: 'uploadedBlogMedia' });

  // Blog model -> User associations
  BlogPost.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
  BlogMedia.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

  // ====== BLOG POST ASSOCIATIONS ======
  
  // BlogPost -> BlogMedia (Featured Image)
  BlogPost.belongsTo(BlogMedia, { foreignKey: 'featuredImageId', as: 'featuredImage' });
  BlogMedia.hasMany(BlogPost, { foreignKey: 'featuredImageId', as: 'featuredInPosts' });

  // ====== MANY-TO-MANY ASSOCIATIONS ======
  
  // BlogPost <-> BlogCategory (Many-to-Many)
  BlogPost.belongsToMany(BlogCategory, {
    through: BlogPostCategory,
    foreignKey: 'postId',
    otherKey: 'categoryId',
    as: 'categories'
  });
  
  BlogCategory.belongsToMany(BlogPost, {
    through: BlogPostCategory,
    foreignKey: 'categoryId',
    otherKey: 'postId',
    as: 'posts'
  });

  // BlogPost <-> BlogTag (Many-to-Many)
  BlogPost.belongsToMany(BlogTag, {
    through: BlogPostTag,
    foreignKey: 'postId',
    otherKey: 'tagId',
    as: 'tags'
  });
  
  BlogTag.belongsToMany(BlogPost, {
    through: BlogPostTag,
    foreignKey: 'tagId',
    otherKey: 'postId',
    as: 'posts'
  });

  // BlogPost <-> BlogVideo (Many-to-Many)
  BlogPost.belongsToMany(BlogVideo, {
    through: BlogPostVideo,
    foreignKey: 'postId',
    otherKey: 'videoId',
    as: 'videos'
  });
  
  BlogVideo.belongsToMany(BlogPost, {
    through: BlogPostVideo,
    foreignKey: 'videoId',
    otherKey: 'postId',
    as: 'posts'
  });

  // ====== JUNCTION TABLE ASSOCIATIONS ======
  
  // BlogPostCategory direct associations
  BlogPostCategory.belongsTo(BlogPost, { foreignKey: 'postId', as: 'post' });
  BlogPostCategory.belongsTo(BlogCategory, { foreignKey: 'categoryId', as: 'category' });
  
  BlogPost.hasMany(BlogPostCategory, { foreignKey: 'postId', as: 'postCategories' });
  BlogCategory.hasMany(BlogPostCategory, { foreignKey: 'categoryId', as: 'categoryPosts' });

  // BlogPostTag direct associations
  BlogPostTag.belongsTo(BlogPost, { foreignKey: 'postId', as: 'post' });
  BlogPostTag.belongsTo(BlogTag, { foreignKey: 'tagId', as: 'tag' });
  
  BlogPost.hasMany(BlogPostTag, { foreignKey: 'postId', as: 'postTags' });
  BlogTag.hasMany(BlogPostTag, { foreignKey: 'tagId', as: 'tagPosts' });

  // BlogPostVideo direct associations
  BlogPostVideo.belongsTo(BlogPost, { foreignKey: 'postId', as: 'post' });
  BlogPostVideo.belongsTo(BlogVideo, { foreignKey: 'videoId', as: 'video' });
  
  BlogPost.hasMany(BlogPostVideo, { foreignKey: 'postId', as: 'postVideos' });
  BlogVideo.hasMany(BlogPostVideo, { foreignKey: 'videoId', as: 'videoPosts' });

  // ====== SEO ASSOCIATIONS ======
  
  // SEO can be associated with different entity types
  // We'll handle this through queries rather than direct associations
  // since it's a polymorphic relationship (entityType + entityId)
  
  console.log('✅ Blog model associations initialized successfully');
};

// Helper function to get SEO for a specific entity
export const getBlogSeoForEntity = async (
  clientId: string, 
  entityType: 'post' | 'category' | 'tag', 
  entityId: number
) => {
  return BlogSeo.findOne({
    where: {
      clientId,
      entityType,
      entityId
    }
  });
};

// Helper function to create/update SEO for an entity
export const upsertBlogSeoForEntity = async (
  clientId: string,
  entityType: 'post' | 'category' | 'tag',
  entityId: number,
  seoData: Partial<{
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImageId: number;
    twitterTitle: string;
    twitterDescription: string;
    twitterImageId: number;
    focusKeyword: string;
  }>
) => {
  const [seoRecord, created] = await BlogSeo.findOrCreate({
    where: {
      clientId,
      entityType,
      entityId
    },
    defaults: {
      clientId,
      entityType,
      entityId,
      ...seoData
    }
  });

  if (!created && Object.keys(seoData).length > 0) {
    await seoRecord.update(seoData);
  }

  return seoRecord;
};

// Helper function to delete SEO for an entity
export const deleteBlogSeoForEntity = async (
  clientId: string,
  entityType: 'post' | 'category' | 'tag',
  entityId: number
) => {
  return BlogSeo.destroy({
    where: {
      clientId,
      entityType,
      entityId
    }
  });
};

// Helper function to get posts with full associations
export const getBlogPostsWithAssociations = async (
  clientId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: 'draft' | 'published' | 'archived';
    categorySlug?: string;
    tagSlug?: string;
    authorId?: number;
    search?: string;
  } = {}
) => {
  const where: any = { clientId };
  
  if (options.status) {
    where.status = options.status;
  }
  
  if (options.authorId) {
    where.authorId = options.authorId;
  }
  
  if (options.search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${options.search}%` } },
      { content: { [Op.like]: `%${options.search}%` } },
      { excerpt: { [Op.like]: `%${options.search}%` } }
    ];
  }

  const include: any[] = [
    {
      model: Client,
      as: 'client',
      attributes: ['id', 'companyName']
    },
    {
      model: User,
      as: 'author',
      attributes: ['id', 'firstName', 'lastName', 'email']
    },
    {
      model: BlogMedia,
      as: 'featuredImage',
      attributes: ['id', 'fileName', 'spacesKey', 'link', 'altText']
    },
    {
      model: BlogCategory,
      as: 'categories',
      attributes: ['id', 'name', 'slug'],
      through: { attributes: [] }
    },
    {
      model: BlogTag,
      as: 'tags',
      attributes: ['id', 'name', 'slug'],
      through: { attributes: [] }
    },
    {
      model: BlogVideo,
      as: 'videos',
      attributes: ['id', 'youtubeId', 'title', 'description'],
      through: { attributes: ['displayOrder'] }
    }
  ];

  // Filter by category if specified
  if (options.categorySlug) {
    include.push({
      model: BlogCategory,
      as: 'categories',
      where: { slug: options.categorySlug },
      required: true,
      attributes: ['id', 'name', 'slug'],
      through: { attributes: [] }
    });
  }

  // Filter by tag if specified
  if (options.tagSlug) {
    include.push({
      model: BlogTag,
      as: 'tags',
      where: { slug: options.tagSlug },
      required: true,
      attributes: ['id', 'name', 'slug'],
      through: { attributes: [] }
    });
  }

  return BlogPost.findAndCountAll({
    where,
    include,
    limit: options.limit || 10,
    offset: options.offset || 0,
    order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
    distinct: true
  });
};

// Helper function to get a single blog post with all associations
export const getBlogPostBySlug = async (clientId: string, slug: string) => {
  return BlogPost.findOne({
    where: { clientId, slug },
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'companyName']
      },
      {
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
      },
      {
        model: BlogMedia,
        as: 'featuredImage',
        attributes: ['id', 'fileName', 'spacesKey', 'link', 'altText', 'fileType']
      },
      {
        model: BlogCategory,
        as: 'categories',
        attributes: ['id', 'name', 'slug', 'description'],
        through: { attributes: [] }
      },
      {
        model: BlogTag,
        as: 'tags',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] }
      },
      {
        model: BlogVideo,
        as: 'videos',
        attributes: ['id', 'youtubeId', 'title', 'description'],
        through: { attributes: ['displayOrder'] },
        order: [['displayOrder', 'ASC']]
      }
    ]
  });
};

// Helper function to get blog categories with post counts
export const getBlogCategoriesWithCounts = async (clientId: string) => {
  return BlogCategory.findAll({
    where: { clientId },
    attributes: [
      'id',
      'name',
      'slug',
      'description',
      [sequelize.fn('COUNT', sequelize.col('posts.id')), 'postCount']
    ],
    include: [
      {
        model: BlogPost,
        as: 'posts',
        attributes: [],
        where: { status: 'published' },
        required: false
      }
    ],
    group: ['BlogCategory.id'],
    order: [['name', 'ASC']]
  });
};

// Helper function to get blog tags with post counts
export const getBlogTagsWithCounts = async (clientId: string) => {
  return BlogTag.findAll({
    where: { clientId },
    attributes: [
      'id',
      'name',
      'slug',
      [sequelize.fn('COUNT', sequelize.col('posts.id')), 'postCount']
    ],
    include: [
      {
        model: BlogPost,
        as: 'posts',
        attributes: [],
        where: { status: 'published' },
        required: false
      }
    ],
    group: ['BlogTag.id'],
    order: [['name', 'ASC']]
  });
};

// Export all blog models for convenience
export {
  BlogCategory,
  BlogTag,
  BlogVideo,
  BlogMedia,
  BlogSeo,
  BlogPost,
  BlogPostCategory,
  BlogPostTag,
  BlogPostVideo
};