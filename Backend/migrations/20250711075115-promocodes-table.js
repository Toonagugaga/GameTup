'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PromoCodes', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('percentage', 'fixed_amount', 'bonus_amount'),
        allowNull: false
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      minAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      maxDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      usageLimit: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      userUsageLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      applicableGames: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('PromoCodes', ['code'], {
      unique: true,
      name: 'promo_codes_code_unique'
    })

    await queryInterface.addIndex('PromoCodes', ['isActive'], {
      name: 'promo_codes_is_active_index'
    })

    await queryInterface.addIndex('PromoCodes', ['startDate', 'endDate'], {
      name: 'promo_codes_date_range_index'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PromoCodes')
  }
}
