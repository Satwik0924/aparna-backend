'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if menu items already exist
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM menu_items",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing.count > 0) {
      console.log('Menu items already exist, skipping seeding');
      return;
    }

    // Get clients and menus
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const menus = await queryInterface.sequelize.query(
      'SELECT id, name, client_id FROM menus',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    // Get menus for each client
    const aparnaMainMenu = menus.find(m => m.name === 'Main Navigation' && m.client_id === aparnaClient.id);
    const aparnaFooterMenu = menus.find(m => m.name === 'Footer Menu' && m.client_id === aparnaClient.id);
    const aparnaMobileMenu = menus.find(m => m.name === 'Mobile Menu' && m.client_id === aparnaClient.id);

    const prestigeMainMenu = menus.find(m => m.name === 'Main Navigation' && m.client_id === prestigeClient.id);
    const prestigeFooterMenu = menus.find(m => m.name === 'Footer Menu' && m.client_id === prestigeClient.id);
    const prestigeServicesMenu = menus.find(m => m.name === 'Services Menu' && m.client_id === prestigeClient.id);

    const lodhaMainMenu = menus.find(m => m.name === 'Main Navigation' && m.client_id === lodhaClient.id);
    const lodhaFooterMenu = menus.find(m => m.name === 'Footer Menu' && m.client_id === lodhaClient.id);
    const lodhaLuxuryMenu = menus.find(m => m.name === 'Luxury Collection Menu' && m.client_id === lodhaClient.id);

    const menuItems = [
      // Aparna Main Navigation Menu Items
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaMainMenu.id,
        parent_id: null,
        title: 'Home',
        url: '/',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-home',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaMainMenu.id,
        parent_id: null,
        title: 'About Us',
        url: '/about',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-about',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaMainMenu.id,
        parent_id: null,
        title: 'Properties',
        url: '/properties',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-properties',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaMainMenu.id,
        parent_id: null,
        title: 'Projects',
        url: '/projects',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-projects',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaMainMenu.id,
        parent_id: null,
        title: 'Gallery',
        url: '/gallery',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-gallery',
        sort_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaMainMenu.id,
        parent_id: null,
        title: 'Contact',
        url: '/contact',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-contact',
        sort_order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Aparna Footer Menu Items
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaFooterMenu.id,
        parent_id: null,
        title: 'Privacy Policy',
        url: '/privacy-policy',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'footer-privacy',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaFooterMenu.id,
        parent_id: null,
        title: 'Terms & Conditions',
        url: '/terms-conditions',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'footer-terms',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaFooterMenu.id,
        parent_id: null,
        title: 'Careers',
        url: '/careers',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'footer-careers',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        menu_id: aparnaFooterMenu.id,
        parent_id: null,
        title: 'RERA',
        url: '/rera-compliance',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'footer-rera',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Main Navigation Menu Items
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        menu_id: prestigeMainMenu.id,
        parent_id: null,
        title: 'Home',
        url: '/',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-home',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        menu_id: prestigeMainMenu.id,
        parent_id: null,
        title: 'About Prestige',
        url: '/about',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-about',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        menu_id: prestigeMainMenu.id,
        parent_id: null,
        title: 'Residential',
        url: '/residential',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-residential',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        menu_id: prestigeMainMenu.id,
        parent_id: null,
        title: 'Commercial',
        url: '/commercial',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-commercial',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        menu_id: prestigeMainMenu.id,
        parent_id: null,
        title: 'Hospitality',
        url: '/hospitality',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-hospitality',
        sort_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        menu_id: prestigeMainMenu.id,
        parent_id: null,
        title: 'Investor Relations',
        url: '/investors',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-investors',
        sort_order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Services Menu Items
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        menu_id: prestigeServicesMenu.id,
        parent_id: null,
        title: 'Property Management',
        url: '/services/property-management',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'service-property-mgmt',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        menu_id: prestigeServicesMenu.id,
        parent_id: null,
        title: 'Construction Services',
        url: '/services/construction',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'service-construction',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        menu_id: prestigeServicesMenu.id,
        parent_id: null,
        title: 'Design & Architecture',
        url: '/services/design-architecture',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'service-design',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Main Navigation Menu Items
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaMainMenu.id,
        parent_id: null,
        title: 'Home',
        url: '/',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-home',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaMainMenu.id,
        parent_id: null,
        title: 'About Lodha',
        url: '/about',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-about',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaMainMenu.id,
        parent_id: null,
        title: 'Luxury Homes',
        url: '/luxury-homes',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-luxury',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaMainMenu.id,
        parent_id: null,
        title: 'Premium Developments',
        url: '/premium-developments',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-premium',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaMainMenu.id,
        parent_id: null,
        title: 'Lifestyle',
        url: '/lifestyle',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-lifestyle',
        sort_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaMainMenu.id,
        parent_id: null,
        title: 'Contact Us',
        url: '/contact',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'nav-contact',
        sort_order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Luxury Collection Menu Items
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaLuxuryMenu.id,
        parent_id: null,
        title: 'World One',
        url: '/luxury/world-one',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'luxury-world-one',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaLuxuryMenu.id,
        parent_id: null,
        title: 'Bellissimo',
        url: '/luxury/bellissimo',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'luxury-bellissimo',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaLuxuryMenu.id,
        parent_id: null,
        title: 'Luxury Amenities',
        url: '/luxury/amenities',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'luxury-amenities',
        sort_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        menu_id: lodhaLuxuryMenu.id,
        parent_id: null,
        title: 'Concierge Services',
        url: '/luxury/concierge',
        link_type: 'internal',
        target_blank: false,
        css_classes: 'luxury-concierge',
        sort_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('menu_items', menuItems);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('menu_items', null, {});
  }
};