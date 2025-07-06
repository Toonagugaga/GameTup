// middleware/auth.js
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        if (!token) {
            return res.status(401).json({ message: 'ไม่มี Token' })
        }

        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select('-password')
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'ผู้ใช้ไม่พบหรือถูกระงับ' })
        }

        req.user = decoded
        req.userInfo = user
        next()
    } catch (error) {
        res.status(401).json({ message: 'Token ไม่ถูกต้อง' })
    }
}

module.exports = { auth }