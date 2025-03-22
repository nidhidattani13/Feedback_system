// db.js
const { Sequelize } = require("sequelize");

// Connect to MySQL
const sequelize = new Sequelize("your_db_name", "your_username", "your_password", {
  host: "your_db_host",
  dialect: "mysql", // or "postgres"
});

module.exports = sequelize;
