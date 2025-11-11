require('dotenv').config();

const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
  dialect: "postgresql",
  schema: "./src/models/*.js",
  out: "./src/migrations",
  dbCredentials:{
    url:process.env.DATABASE_URL
  }
});
