'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PromoCodeUsages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      promoCodeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'PromoCodes',
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
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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
    await queryInterface.addIndex('PromoCodeUsages', ['promoCodeId'], {
      name: 'promo_code_usage_promo_code_id_index'
    })

    await queryInterface.addIndex('PromoCodeUsages', ['userId'], {
      name: 'promo_code_usage_user_id_index'
    })

    await queryInterface.addIndex('PromoCodeUsages', ['orderId'], {
      name: 'promo_code_usage_order_id_index'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PromoCodeUsages')
  }
}
