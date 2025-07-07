// routes/games.js - ปรับปรุงสำหรับ Sequelize
const express = require('express')
const { Op } = require('sequelize')
const Game = require('../models/Game')
const { auth, adminAuth } = require('../middleware/auth')

const router = express.Router()

// ดูรายการเกมทั้งหมด (สำหรับลูกค้า)
router.get('/', async (req, res) => {
    try {
        const { category, search, featured, page = 1, limit = 10 } = req.query
        const offset = (page - 1) * limit

        // สร้าง where condition
        const whereCondition = { isActive: true }

        if (category) {
            whereCondition.category = category
        }

        if (featured === 'true') {
            whereCondition.isFeatured = true
        }

        if (search) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { displayName: { [Op.iLike]: `%${search}%` } }
            ]
        }

        const { count, rows: games } = await Game.findAndCountAll({
            where: whereCondition,
            order: [['isFeatured', 'DESC'], ['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        res.json({
            games,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        })
    } catch (error) {
        console.error('Get games error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ดูรายละเอียดเกม
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findByPk(req.params.id)

        if (!game || !game.isActive) {
            return res.status(404).json({ message: 'ไม่พบเกมนี้' })
        }

        res.json({ game })
    } catch (error) {
        console.error('Get game error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ดูเกมตามหมวดหมู่
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params
        const { page = 1, limit = 10 } = req.query
        const offset = (page - 1) * limit

        const { count, rows: games } = await Game.findAndCountAll({
            where: {
                category,
                isActive: true
            },
            order: [['isFeatured', 'DESC'], ['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        res.json({
            games,
            category,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        })
    } catch (error) {
        console.error('Get games by category error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ดูเกมที่แนะนำ
router.get('/featured/list', async (req, res) => {
    try {
        const games = await Game.findAll({
            where: {
                isFeatured: true,
                isActive: true
            },
            order: [['createdAt', 'DESC']],
            limit: 6
        })

        res.json({ games })
    } catch (error) {
        console.error('Get featured games error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ค้นหาเกม
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params
        const { page = 1, limit = 10 } = req.query
        const offset = (page - 1) * limit

        const { count, rows: games } = await Game.findAndCountAll({
            where: {
                [Op.and]: [
                    { isActive: true },
                    {
                        [Op.or]: [
                            { name: { [Op.iLike]: `%${query}%` } },
                            { displayName: { [Op.iLike]: `%${query}%` } },
                            { description: { [Op.iLike]: `%${query}%` } }
                        ]
                    }
                ]
            },
            order: [['isFeatured', 'DESC'], ['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        res.json({
            games,
            query,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        })
    } catch (error) {
        console.error('Search games error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ดูหมวดหมู่เกมทั้งหมด
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Game.findAll({
            attributes: ['category'],
            where: { isActive: true },
            group: ['category'],
            raw: true
        })

        const categoryList = categories.map(cat => cat.category)

        res.json({ categories: categoryList })
    } catch (error) {
        console.error('Get categories error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// === Admin Routes ===

// ดูเกมทั้งหมด (Admin)
router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const offset = (page - 1) * limit

        const { count, rows: games } = await Game.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        })

        res.json({
            games,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        })
    } catch (error) {
        console.error('Get all games (admin) error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// เพิ่มเกมใหม่ (Admin)
router.post('/admin/create', adminAuth, async (req, res) => {
    try {
        const game = await Game.create(req.body)
        res.status(201).json({
            message: 'เพิ่มเกมสำเร็จ',
            game
        })
    } catch (error) {
        console.error('Create game error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// อัพเดทเกม (Admin)
router.put('/admin/:id', adminAuth, async (req, res) => {
    try {
        const game = await Game.findByPk(req.params.id)
        if (!game) {
            return res.status(404).json({ message: 'ไม่พบเกมนี้' })
        }

        await game.update(req.body)
        res.json({
            message: 'อัพเดทเกมสำเร็จ',
            game
        })
    } catch (error) {
        console.error('Update game error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ลบเกม (Admin)
router.delete('/admin/:id', adminAuth, async (req, res) => {
    try {
        const game = await Game.findByPk(req.params.id)
        if (!game) {
            return res.status(404).json({ message: 'ไม่พบเกมนี้' })
        }

        await game.destroy()
        res.json({ message: 'ลบเกมสำเร็จ' })
    } catch (error) {
        console.error('Delete game error:', error)
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

module.exports = router