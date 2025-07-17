'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // หา gameId ของแต่ละเกมก่อน
        const games = await queryInterface.sequelize.query(
            'SELECT id, name FROM "Games" WHERE name IN (:gameNames)',
            {
                replacements: { gameNames: ['valorant', 'rov', 'freefire', 'pubgm', 'lol', 'genshin'] },
                type: queryInterface.sequelize.QueryTypes.SELECT
            }
        )

        const gameIds = games.map(game => game.id)

        const promoCodes = [
            // โค้ดลดราคาเปอร์เซ็นต์
            {
                code: 'WELCOME10',
                name: 'ยินดีต้อนรับ',
                description: 'ส่วนลด 10% สำหรับสมาชิกใหม่',
                type: 'percentage',
                value: 10.00,
                minAmount: 50.00,
                maxDiscount: 100.00,
                usageLimit: 1000,
                usageCount: 0,
                userUsageLimit: 1,
                applicableGames: JSON.stringify([]), // ใช้ได้กับเกมทั้งหมด
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                code: 'SAVE15',
                name: 'ประหยัด 15%',
                description: 'ส่วนลด 15% สำหรับการซื้อขั้นต่ำ 200 บาท',
                type: 'percentage',
                value: 15.00,
                minAmount: 200.00,
                maxDiscount: 500.00,
                usageLimit: 500,
                usageCount: 0,
                userUsageLimit: 3,
                applicableGames: JSON.stringify([]), // ใช้ได้กับเกมทั้งหมด
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-06-30'),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                code: 'VIP25',
                name: 'VIP ส่วนลด 25%',
                description: 'ส่วนลด 25% สำหรับการซื้อขั้นต่ำ 500 บาท',
                type: 'percentage',
                value: 25.00,
                minAmount: 500.00,
                maxDiscount: 1000.00,
                usageLimit: 100,
                usageCount: 0,
                userUsageLimit: 1,
                applicableGames: JSON.stringify([]), // ใช้ได้กับเกมทั้งหมด
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-03-31'),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // โค้ดลดราคาจำนวนคงที่
            {
                code: 'FIXED50',
                name: 'ลดเงินสด 50 บาท',
                description: 'ลดราคา 50 บาท สำหรับการซื้อขั้นต่ำ 200 บาท',
                type: 'fixed_amount',
                value: 50.00,
                minAmount: 200.00,
                maxDiscount: null,
                usageLimit: 200,
                usageCount: 0,
                userUsageLimit: 2,
                applicableGames: JSON.stringify([]), // ใช้ได้กับเกมทั้งหมด
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                code: 'CASH100',
                name: 'ลดเงินสด 100 บาท',
                description: 'ลดราคา 100 บาท สำหรับการซื้อขั้นต่ำ 500 บาท',
                type: 'fixed_amount',
                value: 100.00,
                minAmount: 500.00,
                maxDiscount: null,
                usageLimit: 100,
                usageCount: 0,
                userUsageLimit: 1,
                applicableGames: JSON.stringify([]), // ใช้ได้กับเกมทั้งหมด
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-06-30'),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // โค้ดโบนัสเพิ่มเติม (สำหรับเกมที่รองรับ)
            {
                code: 'BONUS20',
                name: 'โบนัส 20%',
                description: 'ได้เพิ่มอีก 20% ของจำนวนที่ซื้อ',
                type: 'bonus_amount',
                value: 20.00,
                minAmount: 100.00,
                maxDiscount: null,
                usageLimit: 300,
                usageCount: 0,
                userUsageLimit: 1,
                applicableGames: JSON.stringify(gameIds.slice(0, 3)), // ใช้ได้กับเกม 3 เกมแรก
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-02-28'),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // โค้ดเฉพาะเกม
            {
                code: 'VALORANT30',
                name: 'VALORANT ส่วนลด 30%',
                description: 'ส่วนลด 30% เฉพาะเกม VALORANT',
                type: 'percentage',
                value: 30.00,
                minAmount: 100.00,
                maxDiscount: 300.00,
                usageLimit: 50,
                usageCount: 0,
                userUsageLimit: 1,
                applicableGames: JSON.stringify(gameIds.filter((id, index) => games[index].name === 'valorant')),
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-01-31'),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                code: 'FREEFIRE40',
                name: 'Free Fire ส่วนลด 40%',
                description: 'ส่วนลด 40% เฉพาะเกม Free Fire',
                type: 'percentage',
                value: 40.00,
                minAmount: 93.00,
                maxDiscount: 200.00,
                usageLimit: 30,
                usageCount: 0,
                userUsageLimit: 1,
                applicableGames: JSON.stringify(gameIds.filter((id, index) => games[index].name === 'freefire')),
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-02-14'),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // โค้ดพิเศษ (หมดอายุแล้ว - เพื่อทดสอบ)
            {
                code: 'EXPIRED50',
                name: 'โค้ดหมดอายุ',
                description: 'โค้ดทดสอบที่หมดอายุแล้ว',
                type: 'fixed_amount',
                value: 50.00,
                minAmount: 100.00,
                maxDiscount: null,
                usageLimit: 100,
                usageCount: 0,
                userUsageLimit: 1,
                applicableGames: JSON.stringify([]),
                startDate: new Date('2024-12-01'),
                endDate: new Date('2024-12-31'),
                isActive: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },

            // โค้ดที่ใช้หมดแล้ว (เพื่อทดสอบ)
            {
                code: 'LIMIT1',
                name: 'โค้ดจำกัด 1 ครั้ง',
                description: 'โค้ดทดสอบที่มีจำกัดการใช้งาน',
                type: 'fixed_amount',
                value: 25.00,
                minAmount: 50.00,
                maxDiscount: null,
                usageLimit: 1,
                usageCount: 1, // ใช้หมดแล้ว
                userUsageLimit: 1,
                applicableGames: JSON.stringify([]),
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]

        await queryInterface.bulkInsert('PromoCodes', promoCodes, {})
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('PromoCodes', {
            code: [
                'WELCOME10', 'SAVE15', 'VIP25', 'FIXED50', 'CASH100',
                'BONUS20', 'VALORANT30', 'FREEFIRE40', 'EXPIRED50', 'LIMIT1'
            ]
        }, {})
    }
}