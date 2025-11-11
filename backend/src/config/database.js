require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { logger } = require('./logger');

// Create Neon serverless connection
const createNeonConnection = () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create Neon SQL client (HTTP-based, perfect for serverless)
    const sql = neon(process.env.DATABASE_URL);
    
    // Initialize Drizzle ORM with Neon HTTP client
    const db = drizzle({ client: sql });
    
    logger.info('Neon serverless database connection established successfully');
    
    // Test connection function
    const testConnection = async () => {
      try {
        await sql`SELECT NOW() as current_time`;
        logger.info('Neon database connectivity test passed');
      } catch (error) {
         console.error('Neon test query error:', error)
        logger.error('Neon database connectivity test failed:', error);
      }
    };
    
    // Test connection on startup
    testConnection();
    
    return { db, sql, testConnection };
    
  } catch (error) {
    logger.error('Failed to create Neon database connection:', error);
    process.exit(1);
  }
};

// Export database connection
const { db, sql, testConnection } = createNeonConnection();

module.exports = {
  db,           // Drizzle ORM instance
  sql,          // Raw Neon SQL client
  testConnection,
  
  // Graceful shutdown handler (Neon HTTP doesn't need explicit closing)
  closeConnection: async () => {
    try {
      logger.info('Neon HTTP connection closed gracefully (no explicit close needed)');
    } catch (error) {
      logger.error('Error during Neon connection cleanup:', error);
    }
  }
};
