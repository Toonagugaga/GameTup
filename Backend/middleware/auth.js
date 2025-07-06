// middleware/auth.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            })
        }

        // Remove 'Bearer ' prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token

        // Verify token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-secret-key')

        // Check if user still exists
        const user = await User.findById(decoded.userId).select('-password')
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found, authorization denied'
            })
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            })
        }

        req.user = decoded
        req.userInfo = user
        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        res.status(401).json({
            success: false,
            message: 'Invalid token, authorization denied'
        })
    }
}

// Admin middleware
const adminAuth = async (req, res, next) => {
    try {
        // First check if user is authenticated
        await auth(req, res, () => { })

        // Then check if user is admin
        if (req.userInfo.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required'
            })
        }

        next()
    } catch (error) {
        console.error('Admin auth middleware error:', error)
        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        })
    }
}

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')

        if (!token) {
            return next()
        }

        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-secret-key')

        const user = await User.findById(decoded.userId).select('-password')
        if (user && user.isActive) {
            req.user = decoded
            req.userInfo = user
        }

        next()
    } catch (error) {
        // If token is invalid, continue without auth
        next()
    }
}

module.exports = { auth, adminAuth, optionalAuth }