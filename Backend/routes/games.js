// routes/games.js
const express = require('express')
const { body, validationResult } = require('express-validator')
const Game = require('../models/User') // ใช้ Game model จาก User.js
const { auth, adminAuth, optionalAuth } = require('../middleware/auth')

const router = express.Router()

// Get all games (public)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const query = { isActive: true }
        const { category, featured, search } = req.query

        // Filter by category
        if (category) {
            query.category = category
        }

        // Filter by featured
        if (featured === 'true') {
            query.isFeatured = true
        }

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } }
            ]
        }

        const games = await Game.find(query)
            .sort({ sortOrder: 1, createdAt: -1 })
            .select('-__v')

        res.json({
            success: true,
            games
        })
    } catch (error) {
        console.error('Get games error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Get single game by ID
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            })
        }

        if (!game.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Game is not available'
            })
        }

        res.json({
            success: true,
            game
        })
    } catch (error) {
        console.error('Get game error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Get game categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Game.distinct('category', { isActive: true })
        res.json({
            success: true,
            categories
        })
    } catch (error) {
        console.error('Get categories error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Create new game (Admin only)
router.post('/', adminAuth, [
    body('name').notEmpty().withMessage('Game name is required'),
    body('displayName').notEmpty().withMessage('Display name is required'),
    body('category').isIn(['moba', 'fps', 'mmorpg', 'mobile', 'other']).withMessage('Invalid category'),
    body('image').notEmpty().withMessage('Game image is required')
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

        const gameData = req.body
        const game = new Game(gameData)
        await game.save()

        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            game
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Game name already exists'
            })
        }
        console.error('Create game error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Update game (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            })
        }

        Object.assign(game, req.body)
        await game.save()

        res.json({
            success: true,
            message: 'Game updated successfully',
            game
        })
    } catch (error) {
        console.error('Update game error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

// Delete game (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            })
        }

        // Soft delete - just set isActive to false
        game.isActive = false
        await game.save()

        res.json({
            success: true,
            message: 'Game deleted successfully'
        })
    } catch (error) {
        console.error('Delete game error:', error)
        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
})

module.exports = router