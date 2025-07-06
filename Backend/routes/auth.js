// routes/auth.js
const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// Register
router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phone').isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            })
        }

        const { username, email, password, firstName, lastName, phone } = req.body

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        })

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            })
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            phone
        })

        await user.save()

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        )

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                balance: user.balance
            }
        })
    } catch (error) {
        console.error('Registration error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        })
    }
})

// Login
router.post('/login', [
    body('login').notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            })
        }

        const { login, password } = req.body

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ email: login }, { username: login }]
        })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            })
        }

        // Check password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Update last login
        user.lastLogin = new Date()
        await user.save()

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        )

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                balance: user.balance,
                avatar: user.avatar
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        })
    }
})

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                balance: user.balance,
                totalSpent: user.totalSpent,
                avatar: user.avatar,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        })
    } catch (error) {
        console.error('Get user error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Update profile
router.put('/profile', auth, [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            })
        }

        const { firstName, lastName, phone } = req.body
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Update fields if provided
        if (firstName) user.firstName = firstName
        if (lastName) user.lastName = lastName
        if (phone) user.phone = phone

        await user.save()

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                balance: user.balance,
                avatar: user.avatar
            }
        })
    } catch (error) {
        console.error('Update profile error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        })
    }
})

// Change password
router.put('/password', auth, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            })
        }

        const { currentPassword, newPassword } = req.body
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            })
        }

        // Update password
        user.password = newPassword
        await user.save()

        res.json({
            success: true,
            message: 'Password updated successfully'
        })
    } catch (error) {
        console.error('Change password error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error during password change'
        })
    }
})

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    })
})

module.exports = router