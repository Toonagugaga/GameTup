'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('GamePackages', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            gameId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Games',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            amount: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            bonus: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            originalPrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            isPopular: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            sortOrder: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            validUntil: {
                type: Sequelize.DATE,
                allowNull: true
            },
            metadata: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {}
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        })

        // เพิ่ม indexes
        await queryInterface.addIndex('GamePackages', ['gameId'], {
            name: 'game_packages_game_id_index'
        })

        await queryInterface.addIndex('GamePackages', ['isActive'], {
            name: 'game_packages_is_active_index'
        })

        await queryInterface.addIndex('GamePackages', ['isPopular'], {
            name: 'game_packages_is_popular_index'
        })

        await queryInterface.addIndex('GamePackages', ['sortOrder'], {
            name: 'game_packages_sort_order_index'
        })

        await queryInterface.addIndex('GamePackages', ['price'], {
            name: 'game_packages_price_index'
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('GamePackages')
    }
}