// models/UserPromoCode.js - ประวัติการใช้โค้ดโปรโมชั่นของผู้ใช้ (เปลี่ยนชื่อจาก PromoCodeUsage)
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserPromoCode = sequelize.define('UserPromoCode', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    promoCodeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'PromoCodes',
            key: 'id'
        }
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Orders',
            key: 'id'
        }
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    originalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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
    // สถานะการใช้งาน
    status: {
        type: DataTypes.ENUM('active', 'used', 'expired', 'revoked'),
        defaultValue: 'used'
    },
    // วันที่ใช้งาน
    usedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    // หมายเหตุ
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    indexes: [
        { fields: ['userId'] },
        { fields: ['promoCodeId'] },
        { fields: ['orderId'] },
        { fields: ['status'] },
        { fields: ['usedAt'] },
        { fields: ['userId', 'promoCodeId'] } // composite index
    ]
})

module.exports = UserPromoCode