const { Sequelize } = require('sequelize');
require('dotenv').config();

if (!process.env.DB_URI) {
    console.error("Error: DB_URI is missing in .env file.");
    process.exit(1);
}

const sequelize = new Sequelize(process.env.DB_URI, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

module.exports = sequelize;