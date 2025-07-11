// seeders/...-create-admin-user.js (ตัวอย่างชื่อไฟล์)
'use strict'

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs')
// ไม่จำเป็นต้องใช้ uuidv4() เพราะ PK ของคุณน่าจะเป็น INTEGER auto-increment ตามค่า default ของ Sequelize
// ถ้า PK เป็น UUID จริงๆ ก็เก็บไว้ครับ แต่ถ้าไม่ใช่ ให้เอาออก

module.exports = {
  async up(queryInterface, Sequelize) {
    // แก้ไข: ใช้รหัสผ่านเดียวกันกับใน server.js เดิมเพื่อความสอดคล้อง
    const hashedPassword = await bcrypt.hash('admin123456', 10) // <-- แก้ไข: ใช้ 'admin123456'

    await queryInterface.bulkInsert('Users', [{
      // id: uuidv4(), // เอาออกถ้า PK เป็น INTEGER
      username: 'admin',
      email: 'admin@gametup.com', // <-- แก้ไข: ใช้ email เดียวกับโค้ดเดิม
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '0123456789', // <-- เพิ่ม: เพิ่ม field `phone` ตามโค้ดเดิม
      balance: 0, // <-- เพิ่ม: เพิ่ม field `balance` ที่มีค่า default
      totalSpent: 0, // <-- เพิ่ม: เพิ่ม field `totalSpent` ที่มีค่า default
      role: 'admin',
      isActive: true,
      emailVerified: true, // <-- เพิ่ม: เพิ่ม field `emailVerified` ตามโค้ดเดิม
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  async down(queryInterface, Sequelize) {
    // ใช้ email ในการลบจะปลอดภัยกว่า username
    await queryInterface.bulkDelete('Users', {
      email: 'admin@gametup.com' // <-- แก้ไข: ใช้ email ในการลบ
    }, {})
  }
}