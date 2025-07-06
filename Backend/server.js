const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()

// Security Middleware
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
})
app.use('/api/', limiter)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gametup', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/games', require('./routes/games'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/payments', require('./routes/payments'))

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    })
})

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
    console.log(`🔗 API URL: http://localhost:${PORT}/api`)
})