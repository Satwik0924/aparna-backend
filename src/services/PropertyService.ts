import Property from '../models/Property';
import DropdownValue from '../models/DropdownValue';

export class PropertyService {
  /**
   * Standard property attributes for public API endpoints
   * These attributes are consistent across all property-related endpoints
   */
  static readonly PUBLIC_ATTRIBUTES = [
    'id',
    'name',
    'slug',
    'reraNumber',
    'propertyTypeId',
    'statusId',
    'cityId',
    'areaId',
    'bannerDesktopUrl',
    'bannerMobileUrl',
    'bannerDesktopAlt',
    'bannerMobileAlt',
    'logoUrl',
    'logoAlt',
    'basicSectionData',
    'basicDynamicFields',
    'highlightsDynamicFields',
    'sortOrder',
    'sellDoProjectId',
    'created_at'
  ];

  /**
   * Standard property type association for public API
   */
  static readonly PROPERTY_TYPE_INCLUDE = {
    association: 'propertyType',
    attributes: ['id', 'value', 'slug', 'color']
  };

  /**
   * Standard property status association for public API
   */
  static readonly PROPERTY_STATUS_INCLUDE = {
    association: 'status',
    attributes: ['id', 'value', 'slug', 'color'],
    required: false
  };

  /**
   * Standard configurations association for public API (multi-configuration)
   */
  static readonly CONFIGURATIONS_INCLUDE = {
    association: 'configurations',
    attributes: ['id', 'value', 'slug', 'color'],
    required: false
  };

  /**
   * Standard price ranges association for public API (new multi-price range)
   */
  static readonly PRICE_RANGES_INCLUDE = {
    association: 'priceRanges',
    attributes: ['id', 'value', 'slug', 'color'],
    required: false
  };

  /**
   * Standard city association for public API
   */
  static readonly CITY_INCLUDE = {
    association: 'cityDropdown',
    attributes: ['id', 'value', 'slug'],
    required: false
  };

  /**
   * Standard area association for public API
   */
  static readonly AREA_INCLUDE = {
    association: 'areaDropdown',
    attributes: ['id', 'value', 'slug', 'color'],
    required: false
  };


  /**
   * Standard includes for property queries
   */
  static readonly STANDARD_INCLUDES = [
    PropertyService.PROPERTY_TYPE_INCLUDE
  ];

  /**
   * Standard includes with all dropdown associations
   */
  static readonly INCLUDES_WITH_ALL_DROPDOWNS = [
    PropertyService.PROPERTY_TYPE_INCLUDE,
    PropertyService.PROPERTY_STATUS_INCLUDE,
    PropertyService.CONFIGURATIONS_INCLUDE,
    PropertyService.CITY_INCLUDE,
    PropertyService.AREA_INCLUDE,
    PropertyService.PRICE_RANGES_INCLUDE
  ];

  /**
   * Standard includes with status (for recommendations, etc.)
   */
  static readonly INCLUDES_WITH_STATUS = [
    PropertyService.PROPERTY_TYPE_INCLUDE,
    PropertyService.PROPERTY_STATUS_INCLUDE
  ];

  /**
   * Format property data for consistent public API response
   * @param property - Property instance or plain object
   * @param includeExtras - Additional fields to include (like sortOrder)
   */
  static formatPropertyForAPI(property: any, includeExtras: Record<string, any> = {}) {
    const formattedProperty: any = {
      id: property.id,
      name: property.name,
      slug: property.slug,
      reraNumber: property.reraNumber,
      propertyTypeId: property.propertyTypeId,
      statusId: property.statusId,
      cityId: property.cityId,
      areaId: property.areaId,
      propertyType: property.propertyType,
      status: property.status,
      configurations: property.configurations,
      cityDropdown: property.cityDropdown,
      areaDropdown: property.areaDropdown,
      priceRanges: property.priceRanges,
      bannerDesktopUrl: property.bannerDesktopUrl,
      bannerMobileUrl: property.bannerMobileUrl,
      bannerDesktopAlt: property.bannerDesktopAlt,
      bannerMobileAlt: property.bannerMobileAlt,
      logoUrl: property.logoUrl,
      logoAlt: property.logoAlt,
      basicSectionData: property.basicSectionData,
      basicDynamicFields: property.basicDynamicFields,
      highlightsDynamicFields: property.highlightsDynamicFields,
      sellDoProjectId: property.sellDoProjectId
    };

    // Add any extra fields (like sortOrder for recommendations/carousels)
    return { ...formattedProperty, ...includeExtras };
  }

  /**
   * Format array of properties for consistent API response
   */
  static formatPropertiesForAPI(properties: any[], includeExtrasCallback?: (property: any, index: number) => Record<string, any>) {
    return properties.map((property, index) => {
      const extras = includeExtrasCallback ? includeExtrasCallback(property, index) : {};
      return PropertyService.formatPropertyForAPI(property, extras);
    });
  }

  /**
   * Standard query options for property listings
   */
  static getStandardQueryOptions(whereConditions: any = {}, additionalIncludes: any[] = []) {
    return {
      where: whereConditions,
      attributes: PropertyService.PUBLIC_ATTRIBUTES,
      include: [
        ...PropertyService.STANDARD_INCLUDES,
        ...additionalIncludes
      ],
      order: [['created_at', 'DESC']] as any
    };
  }

  /**
   * Query options for property associations (recommendations, carousels)
   */
  static getAssociationQueryOptions(includeStatus: boolean = false) {
    return {
      attributes: PropertyService.PUBLIC_ATTRIBUTES,
      include: includeStatus 
        ? PropertyService.INCLUDES_WITH_STATUS 
        : PropertyService.STANDARD_INCLUDES
    };
  }
}