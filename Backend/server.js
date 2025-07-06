const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100 // จำกัด 100 requests ต่อ IP
})
app.use('/api/', limiter)

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ เชื่อมต่อ MongoDB สำเร็จ'))
    .catch(err => console.error('❌ เชื่อมต่อ MongoDB ล้มเหลว:', err))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/games', require('./routes/games'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/admin', require('./routes/admin'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`🚀 Server รันที่ port ${PORT}`)
})