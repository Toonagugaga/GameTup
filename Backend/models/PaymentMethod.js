// models/PaymentMethod.js - วิธีการชำระเงิน
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const PaymentMethod = sequelize.define('PaymentMethod', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [1, 50]
        }
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('credit_card', 'bank_transfer', 'e_wallet', 'qr_code', 'crypto'),
        allowNull: false
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    minAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 10.00,
        validate: {
            min: 0
        }
    },
    maxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 100000.00,
        validate: {
            min: 0
        }
    },
    fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    feeType: {
        type: DataTypes.ENUM('fixed', 'percentage'),
        defaultValue: 'fixed'
    },
    // การตั้งค่าเฉพาะ
    config: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    // ข้อมูลการเชื่อมต่อ API
    apiConfig: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
}, {
    indexes: [
        { fields: ['name'] },
        { fields: ['type'] },
        { fields: ['provider'] },
        { fields: ['isActive'] },
        { fields: ['sortOrder'] }
    ]
})

module.exports = PaymentMethod