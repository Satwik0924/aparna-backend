import { Sequelize } from 'sequelize';
import { sequelize } from '../utils/database';

// Import all existing models
import User from './User';
import Client from './Client';
import Property from './Property';
import Role from './Role';
import DropdownCategory from './DropdownCategory';
import DropdownValue from './DropdownValue';
import PropertyImage from './PropertyImage';
import PropertyDocument from './PropertyDocument';
import PropertyAmenity from './PropertyAmenity';
import PropertyFloorPlan from './PropertyFloorPlan';
import PropertyLayout from './PropertyLayout';
import PropertyLocationHighlight from './PropertyLocationHighlight';
import PropertyAmenitiesHighlight from './PropertyAmenitiesHighlight';
import PropertyOverviewHighlight from './PropertyOverviewHighlight';
import PropertyTextComponent from './PropertyTextComponent';
import PropertyVideoTestimonial from './PropertyVideoTestimonial';
import PropertyCustomField from './PropertyCustomField';
import { PropertyReview } from './PropertyReview';
import { PropertyConfiguration } from './PropertyConfiguration';
import { PropertyPriceRange } from './PropertyPriceRange';
import ContentType from './ContentType';
import ContentItem from './ContentItem';
import ContentCategory from './ContentCategory';
import ContentTag from './ContentTag';
import ContentCategoryMapping from './ContentCategoryMapping';
import ContentTagMapping from './ContentTagMapping';
import MediaFolder from './MediaFolder';
import MediaFile from './MediaFile';
import FaqCategory from './FaqCategory';
import Faq from './Faq';
import Menu from './Menu';
import MenuItem from './MenuItem';
import Banner from './Banner';
import Carousel from './Carousel';
import CarouselItem from './CarouselItem';
import SeoMetadata from './SeoMetadata';
import PropertyProgressImage from './PropertyProgressImage';
import PropertyRecommendation from './PropertyRecommendation';
import ProjectCarousel from './ProjectCarousel';
import ProjectCarouselItem from './ProjectCarouselItem';
import CareerJob from './CareerJob';

// Import all new blog models
import BlogCategory from './BlogCategory';
import BlogTag from './BlogTag';
import BlogVideo from './BlogVideo';
import BlogMedia from './BlogMedia';
import BlogSeo from './BlogSeo';
import BlogPost from './BlogPost';
import BlogPostCategory from './BlogPostCategory';
import BlogPostTag from './BlogPostTag';
import BlogPostVideo from './BlogPostVideo';

// Import blog associations
import { initializeBlogAssociations } from './BlogAssociations';

// Define existing model associations
const initializeExistingAssociations = () => {
  // User associations
  User.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
  
  // Client associations
  Client.hasMany(User, { foreignKey: 'clientId', as: 'users' });
  Client.hasMany(Property, { foreignKey: 'clientId', as: 'properties' });
  Client.hasMany(ContentItem, { foreignKey: 'clientId', as: 'contentItems' });
  Client.hasMany(ContentCategory, { foreignKey: 'clientId', as: 'contentCategories' });
  Client.hasMany(ContentTag, { foreignKey: 'clientId', as: 'contentTags' });
  Client.hasMany(MediaFile, { foreignKey: 'clientId', as: 'mediaFiles' });
  Client.hasMany(MediaFolder, { foreignKey: 'clientId', as: 'mediaFolders' });
  Client.hasMany(FaqCategory, { foreignKey: 'clientId', as: 'faqCategories' });
  Client.hasMany(Faq, { foreignKey: 'clientId', as: 'faqs' });
  Client.hasMany(Menu, { foreignKey: 'clientId', as: 'menus' });
  Client.hasMany(Banner, { foreignKey: 'clientId', as: 'banners' });
  Client.hasMany(Carousel, { foreignKey: 'clientId', as: 'carousels' });
  Client.hasMany(SeoMetadata, { foreignKey: 'clientId', as: 'seoMetadata' });
  Client.hasMany(DropdownValue, { foreignKey: 'clientId', as: 'dropdownValues' });

  // Property associations
  Property.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  Property.belongsTo(DropdownValue, { foreignKey: 'propertyTypeId', as: 'propertyType' });
  Property.belongsTo(DropdownValue, { foreignKey: 'statusId', as: 'status' });
  // Removed legacy configurationId belongsTo - now using many-to-many relationship
  Property.belongsToMany(DropdownValue, { 
    through: PropertyConfiguration, 
    foreignKey: 'propertyId', 
    otherKey: 'configurationId', 
    as: 'configurations' 
  });
  Property.belongsTo(DropdownValue, { foreignKey: 'cityId', as: 'cityDropdown' });
  Property.belongsTo(DropdownValue, { foreignKey: 'areaId', as: 'areaDropdown' });
  // Removed legacy priceRangeId belongsTo - now using many-to-many relationship
  Property.belongsToMany(DropdownValue, { 
    through: PropertyPriceRange, 
    foreignKey: 'propertyId', 
    otherKey: 'priceRangeId', 
    as: 'priceRanges' 
  });
  Property.hasMany(PropertyImage, { foreignKey: 'propertyId', as: 'images' });
  Property.hasMany(PropertyDocument, { foreignKey: 'propertyId', as: 'documents' });
  Property.hasMany(PropertyAmenity, { foreignKey: 'propertyId', as: 'propertyAmenities' });
  Property.hasMany(PropertyFloorPlan, { foreignKey: 'propertyId', as: 'floorPlans' });
  Property.hasMany(PropertyLayout, { foreignKey: 'propertyId', as: 'layouts' });
  Property.hasMany(PropertyVideoTestimonial, { foreignKey: 'propertyId', as: 'videoTestimonials' });
  Property.hasMany(Faq, { foreignKey: 'propertyId', as: 'faqs' });
  Property.hasMany(PropertyCustomField, { foreignKey: 'propertyId', as: 'customFields' });
  Property.belongsToMany(DropdownValue, { 
    through: PropertyAmenity, 
    foreignKey: 'propertyId', 
    otherKey: 'amenityId', 
    as: 'amenities' 
  });

  // Role associations
  Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

  // Dropdown category self-referencing associations (parent-child)
  DropdownCategory.belongsTo(DropdownCategory, { foreignKey: 'parentId', as: 'parent' });
  DropdownCategory.hasMany(DropdownCategory, { foreignKey: 'parentId', as: 'children' });
  
  // Dropdown category to values associations
  DropdownCategory.hasMany(DropdownValue, { foreignKey: 'categoryId', as: 'values' });
  DropdownValue.belongsTo(DropdownCategory, { foreignKey: 'categoryId', as: 'category' });
  DropdownValue.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  
  // Dropdown value self-referencing associations (parent-child for city-area)
  DropdownValue.belongsTo(DropdownValue, { foreignKey: 'parentId', as: 'parent' });
  DropdownValue.hasMany(DropdownValue, { foreignKey: 'parentId', as: 'children' });
  
  // Dropdown value to properties through PropertyConfiguration
  DropdownValue.belongsToMany(Property, { 
    through: PropertyConfiguration, 
    foreignKey: 'configurationId', 
    otherKey: 'propertyId', 
    as: 'properties' 
  });

  // Dropdown value to properties through PropertyPriceRange
  DropdownValue.belongsToMany(Property, { 
    through: PropertyPriceRange, 
    foreignKey: 'priceRangeId', 
    otherKey: 'propertyId', 
    as: 'priceRangeProperties' 
  });

  // PropertyConfiguration associations
  PropertyConfiguration.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  PropertyConfiguration.belongsTo(DropdownValue, { foreignKey: 'configurationId', as: 'configuration' });

  // PropertyPriceRange associations
  PropertyPriceRange.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  PropertyPriceRange.belongsTo(DropdownValue, { foreignKey: 'priceRangeId', as: 'priceRange' });

  // Property image associations
  PropertyImage.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

  // Property document associations
  PropertyDocument.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

  // Property amenity associations
  PropertyAmenity.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  PropertyAmenity.belongsTo(DropdownValue, { foreignKey: 'amenityId', as: 'amenity' });

  // Property floor plan associations
  PropertyFloorPlan.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

  // Property layout associations
  PropertyLayout.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

  // Property location highlight associations
  Property.hasMany(PropertyLocationHighlight, { foreignKey: 'propertyId', as: 'locationHighlights' });
  PropertyLocationHighlight.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  PropertyLocationHighlight.belongsTo(MediaFile, { foreignKey: 'iconId', as: 'icon' });

  // Property amenities highlight associations
  Property.hasMany(PropertyAmenitiesHighlight, { foreignKey: 'propertyId', as: 'amenitiesHighlights' });
  PropertyAmenitiesHighlight.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  PropertyAmenitiesHighlight.belongsTo(MediaFile, { foreignKey: 'iconId', as: 'icon' });

  // Property overview highlight associations
  Property.hasMany(PropertyOverviewHighlight, { foreignKey: 'propertyId', as: 'overviewHighlights' });
  PropertyOverviewHighlight.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  PropertyOverviewHighlight.belongsTo(MediaFile, { foreignKey: 'iconId', as: 'icon' });

  // Property text component associations
  Property.hasMany(PropertyTextComponent, { foreignKey: 'propertyId', as: 'textComponents' });
  PropertyTextComponent.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  PropertyTextComponent.belongsTo(MediaFile, { foreignKey: 'iconId', as: 'icon' });

  // Property video testimonial associations
  PropertyVideoTestimonial.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

  // Property custom field associations
  PropertyCustomField.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  PropertyCustomField.belongsTo(DropdownValue, { foreignKey: 'fieldKeyId', as: 'fieldKey' });

  // Property review associations
  Property.hasMany(PropertyReview, { foreignKey: 'propertyId', as: 'reviews' });
  PropertyReview.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

  // Property progress image associations
  Property.hasMany(PropertyProgressImage, { foreignKey: 'propertyId', as: 'progressImages' });
  PropertyProgressImage.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

  // Property recommendation associations
  Property.hasMany(PropertyRecommendation, { foreignKey: 'propertyId', as: 'recommendations' });
  Property.hasMany(PropertyRecommendation, { foreignKey: 'recommendedPropertyId', as: 'recommendedBy' });
  PropertyRecommendation.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  PropertyRecommendation.belongsTo(Property, { foreignKey: 'recommendedPropertyId', as: 'recommendedProperty' });

  // Project carousel associations
  Client.hasMany(ProjectCarousel, { foreignKey: 'clientId', as: 'projectCarousels' });
  ProjectCarousel.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  ProjectCarousel.belongsTo(DropdownValue, { foreignKey: 'cityId', as: 'city' });
  ProjectCarousel.belongsTo(DropdownValue, { foreignKey: 'areaId', as: 'area' });
  ProjectCarousel.hasMany(ProjectCarouselItem, { foreignKey: 'carouselId', as: 'items' });
  ProjectCarousel.belongsToMany(Property, { 
    through: ProjectCarouselItem, 
    foreignKey: 'carouselId', 
    otherKey: 'propertyId', 
    as: 'properties' 
  });

  // Project carousel item associations
  ProjectCarouselItem.belongsTo(ProjectCarousel, { foreignKey: 'carouselId', as: 'carousel' });
  ProjectCarouselItem.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
  
  // Property to carousel association
  Property.belongsToMany(ProjectCarousel, { 
    through: ProjectCarouselItem, 
    foreignKey: 'propertyId', 
    otherKey: 'carouselId', 
    as: 'carousels' 
  });

  // Content type associations
  ContentType.hasMany(ContentItem, { foreignKey: 'typeId', as: 'contentItems' });

  // Content item associations
  ContentItem.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  ContentItem.belongsTo(ContentType, { foreignKey: 'typeId', as: 'type' });
  ContentItem.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
  ContentItem.belongsTo(MediaFile, { foreignKey: 'featuredImageId', as: 'featuredImage' });
  ContentItem.belongsToMany(ContentCategory, { 
    through: ContentCategoryMapping, 
    foreignKey: 'contentId', 
    otherKey: 'categoryId', 
    as: 'categories' 
  });
  ContentItem.belongsToMany(ContentTag, { 
    through: ContentTagMapping, 
    foreignKey: 'contentId', 
    otherKey: 'tagId', 
    as: 'tags' 
  });

  // Content category associations
  ContentCategory.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  ContentCategory.belongsToMany(ContentItem, { 
    through: ContentCategoryMapping, 
    foreignKey: 'categoryId', 
    otherKey: 'contentId', 
    as: 'contentItems' 
  });

  // Content tag associations
  ContentTag.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  ContentTag.belongsToMany(ContentItem, { 
    through: ContentTagMapping, 
    foreignKey: 'tagId', 
    otherKey: 'contentId', 
    as: 'contentItems' 
  });

  // Content category mapping associations
  ContentCategoryMapping.belongsTo(ContentItem, { foreignKey: 'contentId', as: 'content' });
  ContentCategoryMapping.belongsTo(ContentCategory, { foreignKey: 'categoryId', as: 'category' });

  // Content tag mapping associations
  ContentTagMapping.belongsTo(ContentItem, { foreignKey: 'contentId', as: 'content' });
  ContentTagMapping.belongsTo(ContentTag, { foreignKey: 'tagId', as: 'tag' });

  // Media folder associations
  MediaFolder.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  MediaFolder.belongsTo(MediaFolder, { foreignKey: 'parentId', as: 'parent' });
  MediaFolder.hasMany(MediaFolder, { foreignKey: 'parentId', as: 'children' });
  MediaFolder.hasMany(MediaFile, { foreignKey: 'folderId', as: 'files' });

  // Media file associations
  MediaFile.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  MediaFile.belongsTo(MediaFolder, { foreignKey: 'folderId', as: 'folder' });
  MediaFile.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

  // FAQ category associations
  FaqCategory.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  FaqCategory.hasMany(Faq, { foreignKey: 'categoryId', as: 'faqs' });

  // FAQ associations
  Faq.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  Faq.belongsTo(FaqCategory, { foreignKey: 'categoryId', as: 'category' });
  Faq.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

  // Menu associations
  Menu.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  Menu.hasMany(MenuItem, { foreignKey: 'menuId', as: 'items' });

  // Menu item associations
  MenuItem.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' });
  MenuItem.belongsTo(MenuItem, { foreignKey: 'parentId', as: 'parent' });
  MenuItem.hasMany(MenuItem, { foreignKey: 'parentId', as: 'children' });

  // Banner associations
  Banner.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

  // Carousel associations
  Carousel.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  Carousel.hasMany(CarouselItem, { foreignKey: 'carouselId', as: 'items' });

  // Carousel item associations
  CarouselItem.belongsTo(Carousel, { foreignKey: 'carouselId', as: 'carousel' });

  // Career job associations
  CareerJob.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
  CareerJob.belongsTo(DropdownValue, { foreignKey: 'departmentId', as: 'department' });
  CareerJob.belongsTo(DropdownValue, { foreignKey: 'jobTypeId', as: 'jobType' });
  CareerJob.belongsTo(DropdownValue, { foreignKey: 'cityId', as: 'cityDropdown' });
  CareerJob.belongsTo(DropdownValue, { foreignKey: 'areaId', as: 'areaDropdown' });

  // SEO metadata associations
  SeoMetadata.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
};

// Initialize all associations
const initializeAssociations = () => {
  console.log('🔗 Initializing existing model associations...');
  initializeExistingAssociations();
  
  console.log('🔗 Initializing blog model associations...');
  initializeBlogAssociations();
  
  console.log('✅ All model associations initialized successfully');
};

// Initialize associations
initializeAssociations();

// Export all existing models
export {
  User,
  Client,
  Property,
  Role,
  DropdownCategory,
  DropdownValue,
  PropertyImage,
  PropertyDocument,
  PropertyAmenity,
  PropertyFloorPlan,
  PropertyLayout,
  PropertyLocationHighlight,
  PropertyAmenitiesHighlight,
  PropertyOverviewHighlight,
  PropertyTextComponent,
  PropertyVideoTestimonial,
  PropertyCustomField,
  PropertyReview,
  PropertyConfiguration,
  PropertyPriceRange,
  ContentType,
  ContentItem,
  ContentCategory,
  ContentTag,
  ContentCategoryMapping,
  ContentTagMapping,
  MediaFolder,
  MediaFile,
  FaqCategory,
  Faq,
  Menu,
  MenuItem,
  Banner,
  Carousel,
  CarouselItem,
  SeoMetadata,
  PropertyProgressImage,
  PropertyRecommendation,
  ProjectCarousel,
  ProjectCarouselItem,
  CareerJob,
  sequelize
};

// Export all blog models
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

// Export default for convenience
export default {
  // Existing models
  User,
  Client,
  Property,
  Role,
  DropdownCategory,
  DropdownValue,
  PropertyImage,
  PropertyDocument,
  PropertyAmenity,
  PropertyFloorPlan,
  PropertyLayout,
  PropertyLocationHighlight,
  PropertyAmenitiesHighlight,
  PropertyOverviewHighlight,
  PropertyTextComponent,
  PropertyVideoTestimonial,
  PropertyCustomField,
  PropertyReview,
  PropertyConfiguration,
  PropertyPriceRange,
  ContentType,
  ContentItem,
  ContentCategory,
  ContentTag,
  ContentCategoryMapping,
  ContentTagMapping,
  MediaFolder,
  MediaFile,
  FaqCategory,
  Faq,
  Menu,
  MenuItem,
  Banner,
  Carousel,
  CarouselItem,
  SeoMetadata,
  PropertyProgressImage,
  PropertyRecommendation,
  ProjectCarousel,
  ProjectCarouselItem,
  CareerJob,
  
  // Blog models
  BlogCategory,
  BlogTag,
  BlogVideo,
  BlogMedia,
  BlogSeo,
  BlogPost,
  BlogPostCategory,
  BlogPostTag,
  BlogPostVideo,
  
  sequelize
};