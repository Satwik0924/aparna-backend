# Database Migration Setup Guide

## ✅ **Migration System Setup Complete**

The database migration system has been successfully configured for the Aparna Constructions CMS project.

## **Files Created**

### **Configuration Files**
- `.sequelizerc` - Sequelize CLI configuration
- `src/config/config.js` - Database configuration for CLI
- `.env` - Environment variables with database credentials

### **Migration Files**
- `001-create-clients-table.js` - Client/tenant management
- `002-create-roles-table.js` - User roles and permissions
- `003-create-users-table.js` - System users
- `004-create-dropdown-categories-table.js` - Dropdown categories
- `005-create-dropdown-values-table.js` - Dropdown values
- `006-create-properties-table.js` - Property management
- `007-create-property-images-table.js` - Property images
- `008-create-property-documents-table.js` - Property documents
- `009-create-property-amenities-table.js` - Property amenities
- `010-create-content-types-table.js` - Content types

### **Seed Files**
- `001-default-roles.js` - Default system roles
- `002-default-dropdown-categories.js` - Default dropdown categories
- `003-default-content-types.js` - Default content types

## **Database Configuration**

### **Connection Details**
```
Host: crm-scaledino-apr-2-backup-do-user-3486465-0.i.db.ondigitalocean.com
Port: 25060
Database: aparna_constructions
Username: crm_scaledino
Password: [Set in .env as DB_PASSWORD]
```

### **SSL Configuration**
- SSL is **required** for Digital Ocean managed database
- SSL certificate verification is **disabled** (rejectUnauthorized: false)

## **Available Commands**

### **Migration Commands**
```bash
# Run all pending migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Undo all migrations
npm run db:migrate:undo:all

# Check migration status
npm run db:migrate:status

# Fresh migration (drop all and recreate)
npm run db:fresh
```

### **Seed Commands**
```bash
# Run all seeders
npm run db:seed

# Undo all seeders
npm run db:seed:undo

# Complete database reset (migrations + seeds)
npm run db:reset
```

## **Migration Execution Order**

1. **Foundation Tables**
   - `clients` - Multi-tenant client management
   - `roles` - User role definitions
   - `users` - System users with role assignments

2. **Dropdown System**
   - `dropdown_categories` - Dropdown category definitions
   - `dropdown_values` - Dropdown values with client customization

3. **Core Features**
   - `properties` - Main property management
   - `property_images` - Property image management
   - `property_documents` - Property document management
   - `property_amenities` - Property amenity relationships
   - `content_types` - Content type definitions

## **Default Data**

### **System Roles**
- **Super Admin** - Full system access
- **Client Admin** - Full client data access
- **Content Manager** - Content and media management
- **Property Manager** - Property-specific management
- **Viewer** - Read-only access

### **Dropdown Categories**
- **property_types** - Apartment, Villa, Plot, Commercial
- **property_status** - Available, Sold, Under Construction
- **amenities** - Swimming Pool, Gym, Parking, etc.
- **facing_directions** - North, South, East, West, etc.
- **bhk_types** - Studio, 1BHK, 2BHK, 3BHK, etc.

### **Content Types**
- **Page** - Static pages (About, Contact, etc.)
- **Blog Post** - Blog articles with categories/tags
- **Landing Page** - Campaign-specific landing pages

## **How to Run Migrations**

### **Step 1: Install Dependencies**
```bash
cd backend
npm install
```

### **Step 2: Run Migrations**
```bash
npm run db:migrate
```

### **Step 3: Run Seeders**
```bash
npm run db:seed
```

### **Step 4: Verify Setup**
```bash
npm run db:migrate:status
```

## **Key Features**

### **Multi-Tenant Architecture**
- Each client has isolated data with UUID-based relationships
- Client-specific dropdown customization
- Proper foreign key constraints

### **Data Integrity**
- UUID primary keys for all tables
- Proper foreign key relationships with cascade options
- Unique constraints where needed
- Comprehensive indexing for performance

### **Audit Trail**
- Soft deletes (paranoid mode) on all tables
- Created/updated timestamps
- Deleted timestamp tracking

### **Performance Optimization**
- Strategic database indexes
- Connection pooling configuration
- Optimized queries with proper relationships

## **Important Notes**

### **SSL Connection**
- Digital Ocean managed database requires SSL
- Connection automatically uses SSL with proper configuration

### **Migration Safety**
- All migrations include rollback functionality
- Use `npm run db:migrate:undo` to rollback if needed
- Always backup before running migrations in production

### **Data Relationships**
- Proper foreign key constraints maintain data integrity
- CASCADE deletes where appropriate
- RESTRICT deletes for critical relationships

## **Next Steps**

1. **Run the migrations** to create the database schema
2. **Run the seeders** to populate initial data
3. **Test the database connection** from the application
4. **Create additional migration files** for remaining tables if needed
5. **Set up proper backup procedures** for production

## **Troubleshooting**

### **Connection Issues**
- Verify `.env` file has correct database credentials
- Check if SSL is properly configured
- Ensure database server is accessible

### **Migration Failures**
- Check migration logs for specific errors
- Verify database permissions
- Use `npm run db:migrate:status` to check current state

### **Schema Issues**
- Review foreign key constraints
- Check for duplicate or missing indexes
- Verify data types match between migrations and models

The database migration system is now fully configured and ready for use!