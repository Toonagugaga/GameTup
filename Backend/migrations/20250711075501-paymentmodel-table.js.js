'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Payments', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            orderId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            method: {
                type: Sequelize.ENUM('credit_card', 'bank_transfer', 'truemoney', 'promptpay'),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('pending', 'success', 'failed', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending'
            },
            transactionId: {
                type: Sequelize.STRING,
                allowNull: true
            },
            reference: {
                type: Sequelize.STRING,
                allowNull: true
            },
            gatewayResponse: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            processedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            failureReason: {
                type: Sequelize.TEXT,
                allowNull: true
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
        await queryInterface.addIndex('Payments', ['orderId'], {
            name: 'payments_order_id_index'
        })

        await queryInterface.addIndex('Payments', ['userId'], {
            name: 'payments_user_id_index'
        })

        await queryInterface.addIndex('Payments', ['status'], {
            name: 'payments_status_index'
        })

        await queryInterface.addIndex('Payments', ['transactionId'], {
            name: 'payments_transaction_id_index'
        })

        await queryInterface.addIndex('Payments', ['method'], {
            name: 'payments_method_index'
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Payments')
    }
}