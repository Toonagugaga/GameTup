// models/Order.js - ปรับปรุงสำหรับ PostgreSQL
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    gameId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Games',
            key: 'id'
        }
    },
    // ข้อมูลแพ็คเกจ
    packageData: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    // ข้อมูลบัญชีเกม
    gameAccount: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.ENUM('credit_card', 'bank_transfer', 'truemoney', 'promptpay'),
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    finalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    promoCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paymentReference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    processedAt: {
        type: DataTypes.DATE
    },
    completedAt: {
        type: DataTypes.DATE
    },
    failureReason: {
        type: DataTypes.TEXT
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    hooks: {
        beforeCreate: async (order) => {
            if (!order.orderNumber) {
                const timestamp = Date.now()
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
                order.orderNumber = `GT${timestamp}${random}`
            }
        }
    },
    indexes: [
        { fields: ['orderNumber'] },
        { fields: ['userId'] },
        { fields: ['gameId'] },
        { fields: ['status'] },
        { fields: ['paymentMethod'] },
        { fields: ['createdAt'] }
    ]
})

module.exports = Order
