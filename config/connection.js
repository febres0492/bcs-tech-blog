const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DB_URL
    ? new Sequelize(process.env.DB_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, 
            },
        },
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: 'localhost',
            dialect: 'postgres',
            logging: false
        }
    );

module.exports = sequelize;
