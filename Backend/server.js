// server.js - ปรับปรุงเซิร์ฟเวอร์ (เวอร์ชันใหม่สำหรับใช้กับ Migrations)
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
// เรายังต้อง require sequelize instance เพื่อใช้ใน graceful shutdown
const sequelize = require('./config/database')
require('dotenv').config()

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100,
    message: 'Too many requests from this IP'
})
app.use('/api/', limiter)

// === ส่วนที่ถูกลบออก ===
// ฟังก์ชัน syncDatabase() และ seedDefaultData() ถูกลบออกทั้งหมด
// เพราะเราจะใช้ Migrations และ Seeders แทน
// ======================

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/games', require('./routes/games'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/promo', require('./routes/promo'))
app.use('/api/admin', require('./routes/admin'))

// Health check
app.get('/health', (req, res) => {
    // ในอนาคต อาจจะเพิ่มการเช็คการเชื่อมต่อ db ที่นี่ได้ แต่ตอนนี้แบบนี้ก็เพียงพอ
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Received SIGTERM, shutting down gracefully...')
    await sequelize.close()
    process.exit(0)
})

process.on('SIGINT', async () => {
    console.log('🔄 Received SIGINT, shutting down gracefully...')
    await sequelize.close()
    process.exit(0)
})

// Start server
const PORT = process.env.PORT || 3000
const startServer = () => { // ไม่ต้องเป็น async แล้วก็ได้
    try {
        // === ส่วนที่ถูกแก้ไข ===
        // ไม่ต้องรอ syncDatabase() อีกต่อไป
        // ======================

        // Start server
        app.listen(PORT, () => {
            console.log(`
🚀 Server is running on port ${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}
💾 Database: Managed by Migrations
🔒 Security: Enabled
⚡ Rate Limiting: Enabled
            `)
        })
    } catch (error) {
        console.error('❌ Failed to start server:', error)
        process.exit(1)
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('❌ Unhandled Promise Rejection:', err)
    process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err)
    process.exit(1)
})

// Start the server
startServer()

module.exports = app