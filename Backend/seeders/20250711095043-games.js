// seeders/...-seed-games.js (ตัวอย่างชื่อไฟล์)
'use strict'

// ไม่จำเป็นต้องใช้ uuidv4() ถ้า PK เป็น INTEGER
// const { v4: uuidv4 } = require('uuid')

module.exports = {
  async up(queryInterface, Sequelize) {
    // ใช้ข้อมูลจาก server.js เดิมมาเลย จะได้เหมือนกัน 100%
    await queryInterface.bulkInsert('Games', [
      // === VALORANT ===
      {
        // id: uuidv4(), // เอาออกถ้า PK เป็น INTEGER
        name: 'valorant',
        displayName: 'VALORANT',
        description: 'เกมยิงแบบ 5v5 ที่ผสมผสานระหว่างการใช้ยุทธวิธีและความสามารถพิเศษ',
        category: 'fps', // <-- แก้ไข: ใช้ ENUM value ที่ถูกต้อง (fps, moba, etc.)
        image: '/images/valorant.jpg',
        // สำหรับ PostgreSQL ที่ใช้ JSON/JSONB ไม่ต้องใช้ JSON.stringify()
        topupFields: JSON.stringify([ // <-- แก้ไข: ใช้ JSON.stringify() สำหรับ Postgres
          { name: 'riotId', label: 'Riot ID', type: 'text', placeholder: 'ตัวอย่าง: PlayerName#1234', required: true }
        ]),
        packages: JSON.stringify([ // <-- แก้ไข: ใช้ JSON.stringify()
          { name: '125 VP', amount: 125, price: 50, isPopular: false },
          { name: '420 VP', amount: 420, price: 150, isPopular: true },
          { name: '700 VP', amount: 700, price: 250, isPopular: false },
          { name: '1375 VP', amount: 1375, price: 500, isPopular: false }
        ]),
        isActive: true,
        isFeatured: true,
        minTopup: 10.00, // <-- เพิ่ม: เพิ่ม Field ที่มีค่า default
        maxTopup: 10000.00, // <-- เพิ่ม: เพิ่ม Field ที่มีค่า default
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // === RoV ===
      {
        // id: uuidv4(),
        name: 'rov',
        displayName: 'RoV (Garena)',
        description: 'เกม MOBA ยอดนิยมบนมือถือ',
        category: 'moba', // <-- แก้ไข
        image: '/images/rov.jpg',
        topupFields: JSON.stringify([
          { name: 'playerId', label: 'Player ID', type: 'text', placeholder: 'ตัวอย่าง: 1234567890', required: true }
        ]),
        packages: JSON.stringify([
          { name: '60 คูปอง', amount: 60, price: 20, isPopular: false },
          { name: '180 คูปอง', amount: 180, price: 60, isPopular: true },
          { name: '300 คูปอง', amount: 300, price: 100, isPopular: false }
        ]),
        isActive: true,
        isFeatured: true,
        minTopup: 10.00,
        maxTopup: 10000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // เพิ่ม Free Fire และ PUBG Mobile จากโค้ดเดิมของคุณที่นี่ด้วย...
    ], {})
  },

  async down(queryInterface, Sequelize) {
    // ลบข้อมูลทั้งหมดที่เพิ่มเข้าไป
    await queryInterface.bulkDelete('Games', {
      name: ['valorant', 'rov', 'freefire', 'pubgm'] // <-- แก้ไข: ให้ครอบคลุมทุกเกมที่เพิ่ม
    }, {})
  }
}