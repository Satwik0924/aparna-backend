require('dotenv').config();
const mysql = require('mysql2/promise');

async function addSortOrderColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔗 Connected to database');
    
    // Check if column exists
    const [columns] = await connection.execute("SHOW COLUMNS FROM properties LIKE 'sort_order'");
    if (columns.length === 0) {
      console.log('➕ Adding sort_order column...');
      await connection.execute('ALTER TABLE properties ADD COLUMN sort_order INT NULL COMMENT "Order for displaying properties in lists"');
      
      console.log('📊 Creating index...');
      await connection.execute('CREATE INDEX properties_sort_order_idx ON properties (sort_order)');
      
      console.log('🔢 Setting initial sort_order values...');
      // Set initial sort_order based on created_at (newest first gets lower sort_order)
      await connection.execute(`
        UPDATE properties 
        SET sort_order = (
          SELECT row_num FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY created_at DESC) as row_num
            FROM properties
          ) as ranked
          WHERE ranked.id = properties.id
        )
      `);
      
      console.log('✅ Marking migration as completed...');
      // Mark migration as completed
      await connection.execute("INSERT INTO SequelizeMeta (name) VALUES ('20250729000000-add-sort-order-to-properties.js')");
      
      console.log('🎉 sort_order column added successfully!');
    } else {
      console.log('✅ sort_order column already exists');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await connection.end();
    console.log('🔌 Database connection closed');
  }
}

addSortOrderColumn();