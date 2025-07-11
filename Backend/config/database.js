// config/database.js - PostgreSQL configuration
const { Sequelize } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(process.env.DATABASE_URL || {
    database: process.env.DB_NAME || 'topup_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

// Test connection
const testConnection = async () => {
    try {
        await sequelize.authenticate()
        console.log('✅ เชื่อมต่อ PostgreSQL สำเร็จ')
    } catch (error) {
        console.error('❌ เชื่อมต่อ PostgreSQL ล้มเหลว:', error)
    }
}

testConnection()

module.exports = sequelize