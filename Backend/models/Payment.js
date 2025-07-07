// models/Payment.js - ปรับปรุงสำหรับ Sequelize + PostgreSQL
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Orders',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    method: {
        type: DataTypes.ENUM('credit_card', 'bank_transfer', 'truemoney', 'promptpay'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled'),
        defaultValue: 'pending'
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gatewayResponse: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    failureReason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    indexes: [
        { fields: ['orderId'] },
        { fields: ['userId'] },
        { fields: ['status'] },
        { fields: ['transactionId'] }
    ]
})

module.exports = Payment