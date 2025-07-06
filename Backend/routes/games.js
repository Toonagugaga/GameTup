// routes/games.js
const express = require('express')
const Game = require('../models/Game')
const { auth, adminAuth } = require('../middleware/auth')

const router = express.Router()

// ดูรายการเกมทั้งหมด (สำหรับลูกค้า)
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query
        const query = { isActive: true }

        if (category) query.category = category
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } }
            ]
        }

        const games = await Game.find(query).sort({ isFeatured: -1, createdAt: -1 })
        res.json({ games })
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

// ดูรายละเอียดเกม
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
        if (!game || !game.isActive) {
            return res.status(404).json({ message: 'ไม่พบเกมนี้' })
        }
        res.json({ game })
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
    }
})

module.exports = router

// ตัวอย่างการเพิ่มเกม VALORANT
const addValorantGame = async () => {
    const valorant = new Game({
        name: 'valorant',
        displayName: 'VALORANT',
        description: 'เกมยิงแบบ 5v5 ที่ผสมผสานระหว่างการใช้ยุทธวิธีและความสามารถพิเศษ',
        category: 'fps',
        image: '/images/valorant.jpg',

        topupFields: [
            {
                name: 'gameId',
                label: 'Riot ID',
                type: 'text',
                placeholder: 'ตัวอย่าง: PlayerName#1234',
                required: true
            },
            {
                name: 'server',
                label: 'Server',
                type: 'select',
                options: ['Asia Pacific', 'North America', 'Europe', 'Korea'],
                required: true
            }
        ],

        packages: [
            { name: '125 VP', amount: 125, price: 50, isPopular: false },
            { name: '420 VP', amount: 420, price: 150, isPopular: true },
            { name: '700 VP', amount: 700, price: 250, isPopular: false },
            { name: '1375 VP', amount: 1375, price: 500, isPopular: false },
            { name: '2400 VP', amount: 2400, price: 850, isPopular: false },
            { name: '4000 VP', amount: 4000, price: 1400, isPopular: false }
        ],

        isActive: true,
        isFeatured: true
    })

    await valorant.save()
}