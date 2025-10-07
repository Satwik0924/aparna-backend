'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if carousels already exist
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM carousels",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing.count > 0) {
      console.log('Carousels already exist, skipping seeding');
      return;
    }

    // Get clients
    const clients = await queryInterface.sequelize.query(
      'SELECT id, company_name FROM clients',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const aparnaClient = clients.find(c => c.company_name === 'Aparna Constructions');
    const prestigeClient = clients.find(c => c.company_name === 'Prestige Group');
    const lodhaClient = clients.find(c => c.company_name === 'Lodha Group');

    const carousels = [
      // Aparna Constructions Carousels
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Homepage Hero Carousel',
        slug: 'homepage-hero-carousel',
        type: 'banner',
        description: 'Main hero carousel for the homepage featuring key properties and announcements',
        location: 'homepage_hero',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 5000,
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrows: true,
          fade: false
        }),
        auto_play: true,
        auto_play_speed: 5000,
        show_dots: true,
        show_arrows: true,
        infinite_loop: true,
        transition_effect: 'slide',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Featured Properties Carousel',
        slug: 'featured-properties-carousel',
        type: 'property',
        description: 'Carousel showcasing featured properties on the homepage',
        location: 'homepage_properties',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 4000,
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
          arrows: true,
          fade: false
        }),
        auto_play: true,
        auto_play_speed: 4000,
        show_dots: false,
        show_arrows: true,
        infinite_loop: true,
        transition_effect: 'fade',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: aparnaClient.id,
        name: 'Testimonials Carousel',
        slug: 'testimonials-carousel',
        type: 'testimonial',
        description: 'Customer testimonials and reviews carousel',
        location: 'homepage_testimonials',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 6000,
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrows: false,
          fade: false
        }),
        auto_play: true,
        auto_play_speed: 6000,
        show_dots: true,
        show_arrows: false,
        infinite_loop: true,
        transition_effect: 'slide',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Prestige Group Carousels
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Homepage Hero Carousel',
        slug: 'homepage-hero-carousel',
        type: 'banner',
        description: 'Main hero carousel highlighting Prestige Group projects and achievements',
        location: 'homepage_hero',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 5500,
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrows: true,
          fade: false
        }),
        auto_play: true,
        auto_play_speed: 5500,
        show_dots: true,
        show_arrows: true,
        infinite_loop: true,
        transition_effect: 'slide',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Project Portfolio Carousel',
        slug: 'project-portfolio-carousel',
        type: 'property',
        description: 'Carousel showcasing diverse project portfolio across residential, commercial, and hospitality',
        location: 'homepage_portfolio',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 4500,
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrows: true,
          fade: true
        }),
        auto_play: true,
        auto_play_speed: 4500,
        show_dots: true,
        show_arrows: true,
        infinite_loop: true,
        transition_effect: 'fade',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: prestigeClient.id,
        name: 'Awards and Recognition',
        slug: 'awards-recognition-carousel',
        type: 'gallery',
        description: 'Carousel displaying awards and industry recognition',
        location: 'about_awards',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 3000,
          slidesToShow: 4,
          slidesToScroll: 2,
          infinite: true,
          dots: false,
          arrows: true,
          fade: false
        }),
        auto_play: true,
        auto_play_speed: 3000,
        show_dots: false,
        show_arrows: true,
        infinite_loop: true,
        transition_effect: 'slide',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Lodha Group Carousels
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Luxury Living Carousel',
        slug: 'luxury-living-carousel',
        type: 'banner',
        description: 'Premium carousel showcasing luxury lifestyle and iconic developments',
        location: 'homepage_hero',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 6000,
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrows: true,
          fade: true
        }),
        auto_play: true,
        auto_play_speed: 6000,
        show_dots: true,
        show_arrows: true,
        infinite_loop: true,
        transition_effect: 'fade',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Iconic Projects Carousel',
        slug: 'iconic-projects-carousel',
        type: 'property',
        description: 'Showcase of iconic Lodha developments including World One and Bellissimo',
        location: 'homepage_projects',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 5000,
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrows: true,
          fade: false
        }),
        auto_play: true,
        auto_play_speed: 5000,
        show_dots: true,
        show_arrows: true,
        infinite_loop: true,
        transition_effect: 'slide',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Lifestyle Amenities Carousel',
        slug: 'lifestyle-amenities-carousel',
        type: 'gallery',
        description: 'Carousel highlighting luxury amenities and lifestyle features',
        location: 'lifestyle_amenities',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 4000,
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrows: true,
          fade: false
        }),
        auto_play: true,
        auto_play_speed: 4000,
        show_dots: false,
        show_arrows: true,
        infinite_loop: true,
        transition_effect: 'fade',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        client_id: lodhaClient.id,
        name: 'Celebrity Endorsements',
        slug: 'celebrity-endorsements-carousel',
        type: 'testimonial',
        description: 'Carousel featuring celebrity testimonials and brand ambassadors',
        location: 'homepage_endorsements',
        settings: JSON.stringify({
          autoplay: true,
          autoplaySpeed: 7000,
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
          arrows: true,
          fade: true
        }),
        auto_play: true,
        auto_play_speed: 7000,
        show_dots: true,
        show_arrows: false,
        infinite_loop: true,
        transition_effect: 'slide',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('carousels', carousels);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('carousels', null, {});
  }
};