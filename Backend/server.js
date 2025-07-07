// server.js - ปรับปรุงเซิร์ฟเวอร์
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { User, Game, Order, PromoCode, PromoCodeUsage } = require('./models')
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

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100,
    message: 'Too many requests from this IP'
})
app.use('/api/', limiter)

// Sync database
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true })
        console.log('✅ Database synchronized successfully')

        // Seed default data
        await seedDefaultData()
    } catch (error) {
        console.error('❌ Database sync failed:', error)
    }
}

// Seed default data
const seedDefaultData = async () => {
    try {
        // เพิ่มเกมเริ่มต้น
        const gameCount = await Game.count()
        if (gameCount === 0) {
            await Game.bulkCreate([
                {
                    name: 'valorant',
                    displayName: 'VALORANT',
                    description: 'เกมยิงแบบ 5v5 ที่ผสมผสานระหว่างการใช้ยุทธวิธีและความสามารถพิเศษ',
                    category: 'fps',
                    image: '/images/valorant.jpg',
                    topupFields: [
                        {
                            name: 'riotId',
                            label: 'Riot ID',
                            type: 'text',
                            placeholder: 'ตัวอย่าง: PlayerName#1234',
                            required: true
                        }
                    ],
                    packages: [
                        { name: '125 VP', amount: 125, price: 50, isPopular: false },
                        { name: '420 VP', amount: 420, price: 150, isPopular: true },
                        { name: '700 VP', amount: 700, price: 250, isPopular: false },
                        { name: '1375 VP', amount: 1375, price: 500, isPopular: false }
                    ],
                    isActive: true,
                    isFeatured: true
                },
                {
                    name: 'rov',
                    displayName: 'RoV (Garena)',
                    description: 'เกม MOBA ยอดนิยมบนมือถือ',
                    category: 'moba',
                    image: '/images/rov.jpg',
                    topupFields: [
                        {
                            name: 'playerId',
                            label: 'Player ID',
                            type: 'text',
                            placeholder: 'ตัวอย่าง: 1234567890',
                            required: true
                        }
                    ],
                    packages: [
                        { name: '60 คูปอง', amount: 60, price: 20, isPopular: false },
                        { name: '180 คูปอง', amount: 180, price: 60, isPopular: true },
                        { name: '300 คูปอง', amount: 300, price: 100, isPopular: false }
                    ],
                    isActive: true,
                    isFeatured: true
                }
            ])
            console.log('✅ Default games seeded')
        }

        // เพิ่มโปรโมชั่นเริ่มต้น
        const promoCount = await PromoCode.count()
        if (promoCount === 0) {
            await PromoCode.bulkCreate([
                {
                    code: 'WELCOME10',
                    name: 'ส่วนลดผู้ใช้ใหม่',
                    description: 'ส่วนลด 10% สำหรับผู้ใช้ใหม่',
                    type: 'percentage',
                    value: 10,
                    minAmount: 100,
                    maxDiscount: 50,
                    usageLimit: 1000,
                    userUsageLimit: 1,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 วัน
                    isActive: true
                },
                {
                    code: 'BONUS20',
                    name: 'โบนัสเติมเงิน',
                    description: 'รับโบนัสเพิ่ม 20 บาทเมื่อเติม 500 บาทขึ้นไป',
                    type: 'bonus_amount',
                    value: 20,
                    minAmount: 500,
                    usageLimit: 500,
                    userUsageLimit: 3,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 วัน
                    isActive: true
                }
            ])
            console.log('✅ Default promo codes seeded')
        }
    } catch (error) {
        console.error('❌ Seeding failed:', error)
    }
}

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/games', require('./routes/games'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/promo', require('./routes/promo'))
app.use('/api/admin', require('./routes/admin'))

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

// Start server
const startServer = async () => {
    await syncDatabase()
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`)
    })
}

startServer()