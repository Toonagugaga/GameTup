// models/Game.js - ปรับปรุงให้ตรงกับ migration
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
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: {
                msg: 'Image must be a valid URL'
            }
        }
    },
    // ช่องกรอกข้อมูลที่ต้องการสำหรับการเติมเงิน
    accountFields: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Fields required for game account (e.g., Player ID, Username)'
    },
    // แพ็คเกจเติมเงิน - ใช้เพื่อ compatibility กับโค้ดเดิม
    packages: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Legacy packages field - use GamePackage table instead'
    },
    // คำแนะนำการใช้งาน
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Instructions for users on how to find their game account info'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'Games',
    indexes: [
        { fields: ['name'], unique: true },
        { fields: ['category'] },
        { fields: ['isActive'] },
        { fields: ['isFeatured'] }
    ]
})

module.exports = Game