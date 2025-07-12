'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PaymentMethods', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            displayName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            type: {
                type: Sequelize.ENUM('credit_card', 'bank_transfer', 'e_wallet', 'qr_code', 'crypto'),
                allowNull: false
            },
            provider: {
                type: Sequelize.STRING,
                allowNull: false
            },
            icon: {
                type: Sequelize.STRING,
                allowNull: true
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
            minAmount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            maxAmount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            fee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            feeType: {
                type: Sequelize.ENUM('fixed', 'percentage'),
                allowNull: false,
                defaultValue: 'fixed'
            },
            config: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {}
            },
            apiConfig: {
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
        await queryInterface.addIndex('PaymentMethods', ['name'], {
            unique: true,
            name: 'payment_methods_name_unique'
        })

        await queryInterface.addIndex('PaymentMethods', ['type'], {
            name: 'payment_methods_type_index'
        })

        await queryInterface.addIndex('PaymentMethods', ['provider'], {
            name: 'payment_methods_provider_index'
        })

        await queryInterface.addIndex('PaymentMethods', ['isActive'], {
            name: 'payment_methods_is_active_index'
        })

        await queryInterface.addIndex('PaymentMethods', ['sortOrder'], {
            name: 'payment_methods_sort_order_index'
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PaymentMethods')
    }
}