import express from "express";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config/database";
import { sequelize } from "./utils/database";
import { redisClient } from "./utils/redis";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import cookieParser from 'cookie-parser';
import utmCookieRoutes from "./routes/utmCookies";

import { blogPostRoutes } from "./routes/blogRoutes";
// Import routes
import authRoutes from "./routes/auth";
import clientRoutes from "./routes/clients";
import propertyRoutes from "./routes/properties";
import projectCarouselRoutes from "./routes/projectCarousels";
import statusRoutes from "./routes/status";
import dropdownRoutes from "./routes/dropdowns";
import mediaRoutes from "./routes/media";
import { blogCategoryRoutes } from "./routes/blogCategoryRoutes";
import { blogTagRoutes } from "./routes/blogTagRoutes";
import { blogMediaRoutes } from "./routes/blogMediaRoutes";
import sellDoLeadRoutes from "./routes/sellDoLeadRoutes";
import careerRoutes from "./routes/careers";
import userRoutes from './routes/users';
// import contentRoutes from './routes/content';
// import menuRoutes from './routes/menus';
// import faqRoutes from './routes/faqs';
// import bannerRoutes from './routes/banners';
// import seoRoutes from './routes/seo';
// import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS - Allow ALL origins but handle credentials properly
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, ngrok-skip-browser-warning');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(compression());
app.use(cookieParser());

// Handle preflight requests - removed, cors middleware handles this

// Rate limiting - removed

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging
app.use(requestLogger);

// Add basic request debugging
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Database connection test endpoint
app.get("/test-db", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      message: "Database connection successful",
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      passwordConfigured: !!process.env.DB_PASSWORD,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      passwordConfigured: !!process.env.DB_PASSWORD,
      troubleshooting: {
        suggestions: [
          "Check if database server is running",
          "Verify network connectivity",
          "Check firewall settings",
          "Verify database credentials",
          "Check if your IP is whitelisted on the database server",
        ],
      },
    });
  }
});

// Redis connection test endpoint
app.get("/test-redis", async (req, res) => {
  try {
    await redisClient.ping();
    res.json({
      success: true,
      message: "Redis connection successful",
      url: process.env.REDIS_URL,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Redis connection failed",
      error: error.message,
      url: process.env.REDIS_URL,
    });
  }
});

// Debug endpoint to check users in database
app.get("/debug/users", async (req, res) => {
  try {
    const { default: User } = await import("./models/User");
    const users = await User.findAll({
      attributes: ["id", "firstName", "lastName", "email", "isActive"],
      limit: 10,
    });
    res.json({
      success: true,
      message: `Found ${users.length} users`,
      users: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/project-carousels", projectCarouselRoutes);
app.use("/api/v1/status", statusRoutes);
app.use("/api/v1/dropdowns", dropdownRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/blog/categories", blogCategoryRoutes);
app.use("/api/v1/blog/tags", blogTagRoutes);
app.use("/api/v1/blog/media", blogMediaRoutes);
app.use("/api/v1/blog/posts", blogPostRoutes);
app.use("/api/v1/selldo-leads", sellDoLeadRoutes);
app.use("/api/v1/careers", careerRoutes);
app.use('/api/v1/users', userRoutes);
app.use("/api/v1/utm", utmCookieRoutes);
// app.use('/api/v1/content', contentRoutes);
// app.use('/api/v1/menus', menuRoutes);
// app.use('/api/v1/faqs', faqRoutes);
// app.use('/api/v1/banners', bannerRoutes);
// app.use('/api/v1/seo', seoRoutes);
// app.use('/api/v1/analytics', analyticsRoutes);

// Sitemap endpoint
app.get("/sitemap.xml", async (req, res) => {
  // TODO: Generate dynamic sitemap
  res.type("application/xml");
  res.send(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
  );
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection established successfully");

      // Skip sync since migrations handle schema changes
      console.log("✅ Database ready (using migrations for schema)");
    } catch (dbError: any) {
      console.log(
        "⚠️  Database connection failed, running without database:",
        dbError.message
      );
      console.log(
        "🔧 Check your database configuration and network connectivity"
      );
    }

    // Test Redis connection (optional for now)
    try {
      await redisClient.ping();
      console.log("✅ Redis connection established successfully");
    } catch (error: any) {
      console.log(
        "⚠️  Redis connection failed, continuing without cache:",
        error.message
      );
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 Auth API: http://localhost:${PORT}/api/v1/auth`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
