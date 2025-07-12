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

        const gameMap = {}
        games.forEach(game => {
            gameMap[game.name] = game.id
        })

        const packages = []

        // VALORANT Packages
        if (gameMap['valorant']) {
            packages.push(
                {
                    gameId: gameMap['valorant'],
                    name: '125 VP',
                    description: 'VALORANT Points สำหรับซื้อสกิน และไอเทมในเกม',
                    amount: 125,
                    bonus: 0,
                    price: 50.00,
                    originalPrice: null,
                    isPopular: false,
                    isActive: true,
                    sortOrder: 1,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'VP', type: 'valorant_points' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    gameId: gameMap['valorant'],
                    name: '420 VP',
                    description: 'VALORANT Points สำหรับซื้อสกิน และไอเทมในเกม',
                    amount: 420,
                    bonus: 0,
                    price: 150.00,
                    originalPrice: null,
                    isPopular: true,
                    isActive: true,
                    sortOrder: 2,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'VP', type: 'valorant_points' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    gameId: gameMap['valorant'],
                    name: '700 VP',
                    description: 'VALORANT Points สำหรับซื้อสกิน และไอเทมในเกม',
                    amount: 700,
                    bonus: 0,
                    price: 250.00,
                    originalPrice: null,
                    isPopular: false,
                    isActive: true,
                    sortOrder: 3,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'VP', type: 'valorant_points' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    gameId: gameMap['valorant'],
                    name: '1375 VP',
                    description: 'VALORANT Points สำหรับซื้อสกิน และไอเทมในเกม',
                    amount: 1375,
                    bonus: 0,
                    price: 500.00,
                    originalPrice: null,
                    isPopular: false,
                    isActive: true,
                    sortOrder: 4,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'VP', type: 'valorant_points' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            )
        }

        // RoV Packages
        if (gameMap['rov']) {
            packages.push(
                {
                    gameId: gameMap['rov'],
                    name: '60 คูปอง',
                    description: 'คูปองสำหรับซื้อฮีโร่ และสกินในเกม RoV',
                    amount: 60,
                    bonus: 0,
                    price: 20.00,
                    originalPrice: null,
                    isPopular: false,
                    isActive: true,
                    sortOrder: 1,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'Coupon', type: 'rov_coupon' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    gameId: gameMap['rov'],
                    name: '180 คูปอง',
                    description: 'คูปองสำหรับซื้อฮีโร่ และสกินในเกม RoV',
                    amount: 180,
                    bonus: 0,
                    price: 60.00,
                    originalPrice: null,
                    isPopular: true,
                    isActive: true,
                    sortOrder: 2,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'Coupon', type: 'rov_coupon' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    gameId: gameMap['rov'],
                    name: '300 คูปอง',
                    description: 'คูปองสำหรับซื้อฮีโร่ และสกินในเกม RoV',
                    amount: 300,
                    bonus: 0,
                    price: 100.00,
                    originalPrice: null,
                    isPopular: false,
                    isActive: true,
                    sortOrder: 3,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'Coupon', type: 'rov_coupon' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            )
        }

        // Free Fire Packages
        if (gameMap['freefire']) {
            packages.push(
                {
                    gameId: gameMap['freefire'],
                    name: '100 เพชร',
                    description: 'เพชรสำหรับซื้อสกิน อาวุธ และไอเทมในเกม Free Fire',
                    amount: 100,
                    bonus: 0,
                    price: 31.00,
                    originalPrice: null,
                    isPopular: false,
                    isActive: true,
                    sortOrder: 1,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'Diamond', type: 'freefire_diamond' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    gameId: gameMap['freefire'],
                    name: '310 เพชร',
                    description: 'เพชรสำหรับซื้อสกิน อาวุธ และไอเทมในเกม Free Fire',
                    amount: 310,
                    bonus: 0,
                    price: 93.00,
                    originalPrice: null,
                    isPopular: true,
                    isActive: true,
                    sortOrder: 2,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'Diamond', type: 'freefire_diamond' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    gameId: gameMap['freefire'],
                    name: '520 เพชร',
                    description: 'เพชรสำหรับซื้อสกิน อาวุธ และไอเทมในเกม Free Fire',
                    amount: 520,
                    bonus: 0,
                    price: 155.00,
                    originalPrice: null,
                    isPopular: false,
                    isActive: true,
                    sortOrder: 3,
                    validUntil: null,
                    metadata: JSON.stringify({ currency: 'Diamond', type: 'freefire_diamond' }),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            )
        }

        // เพิ่ม packages ทั้งหมด
        if (packages.length > 0) {
            await queryInterface.bulkInsert('GamePackages', packages, {})
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('GamePackages', null, {})
    }
}