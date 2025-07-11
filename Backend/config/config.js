// config/config.js
require('dotenv').config() // สำคัญมาก! เพื่อให้ CLI อ่านไฟล์ .env

module.exports = {
    development: {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
    },
    test: {
        url: process.env.TEST_DATABASE_URL, // หากมีฐานข้อมูลสำหรับเทส
        dialect: 'postgres',
    },
    production: {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // สำหรับบาง Platform เช่น Heroku, Render
            }
        }
    }
}