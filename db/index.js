const { Pool } = require("pg");

const ENV = process.env.NODE_ENV || "development";
const pathToFile = `${__dirname}/../.env.${ENV}`;

require("dotenv").config({
  path: pathToFile,
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

const config = {};
if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;
}

// Optional: console log for debugging
console.log("DB Connection Config:", config);

module.exports = new Pool(config);
