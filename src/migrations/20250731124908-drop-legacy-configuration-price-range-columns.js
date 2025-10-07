'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🗑️  Dropping legacy configuration_id and price_range_id columns from properties table...');
    
    // Safety check: Verify data has been migrated to junction tables
    const [configCount] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM property_configurations'
    );
    
    const [priceRangeCount] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM property_price_ranges'
    );
    
    console.log(`Found ${configCount[0].count} configuration associations and ${priceRangeCount[0].count} price range associations`);
    
    // Check if there are properties with these fields that aren't migrated
    const [unmigrated] = await queryInterface.sequelize.query(`
      SELECT 
        COUNT(CASE WHEN p.configuration_id IS NOT NULL 
                   AND NOT EXISTS(SELECT 1 FROM property_configurations pc WHERE pc.property_id = p.id AND pc.configuration_id = p.configuration_id) 
                   THEN 1 END) as unmigrated_configs,
        COUNT(CASE WHEN p.price_range_id IS NOT NULL 
                   AND NOT EXISTS(SELECT 1 FROM property_price_ranges pr WHERE pr.property_id = p.id AND pr.price_range_id = p.price_range_id) 
                   THEN 1 END) as unmigrated_price_ranges
      FROM properties p
    `);
    
    if (unmigrated[0].unmigrated_configs > 0 || unmigrated[0].unmigrated_price_ranges > 0) {
      throw new Error(`Migration incomplete: ${unmigrated[0].unmigrated_configs} configurations and ${unmigrated[0].unmigrated_price_ranges} price ranges not migrated`);
    }
    
    // Drop the legacy columns
    try {
      await queryInterface.removeColumn('properties', 'configuration_id');
      console.log('✅ Dropped configuration_id column');
    } catch (error) {
      console.log('⚠️  configuration_id column may not exist:', error.message);
    }
    
    try {
      await queryInterface.removeColumn('properties', 'price_range_id');
      console.log('✅ Dropped price_range_id column');
    } catch (error) {
      console.log('⚠️  price_range_id column may not exist:', error.message);
    }
    
    console.log('🎉 Legacy columns dropped successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back: Adding legacy configuration_id and price_range_id columns...');
    
    // Add the columns back
    await queryInterface.addColumn('properties', 'configuration_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'dropdown_values',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    
    await queryInterface.addColumn('properties', 'price_range_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'dropdown_values',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    
    // Restore data from junction tables (pick first configuration/price range for each property)
    console.log('🔄 Restoring data from junction tables...');
    
    // Restore configurations
    await queryInterface.sequelize.query(`
      UPDATE properties p 
      SET configuration_id = (
        SELECT pc.configuration_id 
        FROM property_configurations pc 
        WHERE pc.property_id = p.id 
        LIMIT 1
      )
      WHERE EXISTS (
        SELECT 1 FROM property_configurations pc2 WHERE pc2.property_id = p.id
      )
    `);
    
    // Restore price ranges
    await queryInterface.sequelize.query(`
      UPDATE properties p 
      SET price_range_id = (
        SELECT pr.price_range_id 
        FROM property_price_ranges pr 
        WHERE pr.property_id = p.id 
        LIMIT 1
      )
      WHERE EXISTS (
        SELECT 1 FROM property_price_ranges pr2 WHERE pr2.property_id = p.id
      )
    `);
    
    console.log('✅ Legacy columns restored with data');
  }
};