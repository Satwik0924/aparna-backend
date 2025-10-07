const mysql = require('mysql2/promise');

async function checkCategories() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aparna_construction_cms'
  });

  try {
    console.log('Checking dropdown categories...');
    
    const [categories] = await connection.execute(
      'SELECT id, name, is_active FROM dropdown_categories WHERE deleted_at IS NULL'
    );
    
    console.log('Found categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat.id}, Active: ${cat.is_active})`);
    });
    
    const propertyTypesCategory = categories.find(cat => cat.name === 'property_types');
    
    if (propertyTypesCategory) {
      console.log('\n✅ property_types category found:', propertyTypesCategory);
      
      // Check values for property_types
      const [values] = await connection.execute(
        'SELECT id, value, slug, is_active FROM dropdown_values WHERE category_id = ? AND deleted_at IS NULL',
        [propertyTypesCategory.id]
      );
      
      console.log('\nProperty type values:');
      values.forEach(val => {
        console.log(`- ${val.value} (slug: ${val.slug}, Active: ${val.is_active})`);
      });
    } else {
      console.log('\n❌ property_types category NOT found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkCategories();