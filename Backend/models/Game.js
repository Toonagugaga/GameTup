// models/Game.js - ปรับปรุงสำหรับ PostgreSQL
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Game = sequelize.define('Game', {
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
            len: [2, 50]
        }
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 100]
        }
    },
    description: {
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.ENUM('moba', 'fps', 'mmorpg', 'mobile', 'battle-royale', 'strategy', 'other'),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        validate: {
            isUrl: true
        }
    },
    // ช่องกรอกข้อมูลที่ต้องการ
    topupFields: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    // แพ็คเกจเติมเงิน
    packages: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    minTopup: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 10.00
    },
    maxTopup: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 10000.00
    }
}, {
    indexes: [
        { fields: ['name'] },
        { fields: ['category'] },
        { fields: ['isActive'] },
        { fields: ['isFeatured'] }
    ]
})

module.exports = Game