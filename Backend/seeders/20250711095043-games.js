'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Games', [
      {
        name: 'valorant',
        displayName: 'VALORANT',
        description: 'เกมยิงแบบ 5v5 ที่ผสมผสานระหว่างการใช้ยุทธวิธีและความสามารถพิเศษ',
        category: 'fps',
        image: '/images/valorant.jpg',
        accountFields: JSON.stringify([
          {
            name: 'riotId',
            label: 'Riot ID',
            type: 'text',
            placeholder: 'ตัวอย่าง: PlayerName#1234',
            required: true,
            description: 'Riot ID ของคุณ (ชื่อผู้เล่น + Tag)'
          }
        ]),
        packages: JSON.stringify([
          { name: '125 VP', amount: 125, price: 50, isPopular: false },
          { name: '420 VP', amount: 420, price: 150, isPopular: true },
          { name: '700 VP', amount: 700, price: 250, isPopular: false },
          { name: '1375 VP', amount: 1375, price: 500, isPopular: false }
        ]),
        instructions: 'วิธีหา Riot ID: เปิดเกม VALORANT > ไปที่ Settings > General > คัดลอก Riot ID ที่แสดงด้านบน',
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'rov',
        displayName: 'RoV (Garena)',
        description: 'เกม MOBA ยอดนิยมบนมือถือ Arena of Valor',
        category: 'moba',
        image: '/images/rov.jpg',
        accountFields: JSON.stringify([
          {
            name: 'playerId',
            label: 'Player ID',
            type: 'text',
            placeholder: 'ตัวอย่าง: 1234567890',
            required: true,
            description: 'Player ID ของคุณในเกม RoV'
          }
        ]),
        packages: JSON.stringify([
          { name: '60 คูปอง', amount: 60, price: 20, isPopular: false },
          { name: '180 คูปอง', amount: 180, price: 60, isPopular: true },
          { name: '300 คูปอง', amount: 300, price: 100, isPopular: false },
          { name: '600 คูปอง', amount: 600, price: 200, isPopular: false }
        ]),
        instructions: 'วิธีหา Player ID: เปิดเกม RoV > ไปที่หน้าโปรไฟล์ > Player ID จะแสดงด้านบน',
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'freefire',
        displayName: 'Free Fire',
        description: 'เกม Battle Royale ยอดนิยมบนมือถือ',
        category: 'battle-royale',
        image: '/images/freefire.jpg',
        accountFields: JSON.stringify([
          {
            name: 'playerId',
            label: 'Player ID',
            type: 'text',
            placeholder: 'ตัวอย่าง: 123456789',
            required: true,
            description: 'Player ID ของคุณในเกม Free Fire'
          }
        ]),
        packages: JSON.stringify([
          { name: '100 เพชร', amount: 100, price: 31, isPopular: false },
          { name: '310 เพชร', amount: 310, price: 93, isPopular: true },
          { name: '520 เพชร', amount: 520, price: 155, isPopular: false },
          { name: '1080 เพชร', amount: 1080, price: 310, isPopular: false },
          { name: '2200 เพชร', amount: 2200, price: 620, isPopular: false }
        ]),
        instructions: 'วิธีหา Player ID: เปิดเกม Free Fire > กดที่ไอคอนโปรไฟล์ > Player ID จะแสดงด้านบน',
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'pubgm',
        displayName: 'PUBG Mobile',
        description: 'เกม Battle Royale รูปแบบ realistic',
        category: 'battle-royale',
        image: '/images/pubgm.jpg',
        accountFields: JSON.stringify([
          {
            name: 'playerId',
            label: 'Player ID',
            type: 'text',
            placeholder: 'ตัวอย่าง: 123456789',
            required: true,
            description: 'Player ID ของคุณในเกม PUBG Mobile'
          }
        ]),
        packages: JSON.stringify([
          { name: '60 UC', amount: 60, price: 31, isPopular: false },
          { name: '180 UC', amount: 180, price: 93, isPopular: true },
          { name: '300 UC', amount: 300, price: 155, isPopular: false },
          { name: '600 UC', amount: 600, price: 310, isPopular: false },
          { name: '1200 UC', amount: 1200, price: 620, isPopular: false }
        ]),
        instructions: 'วิธีหา Player ID: เปิดเกม PUBG Mobile > ไปที่ Settings > Basic > Character ID จะแสดงด้านบน',
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'lol',
        displayName: 'League of Legends',
        description: 'เกม MOBA ยอดนิยมบน PC',
        category: 'moba',
        image: '/images/lol.jpg',
        accountFields: JSON.stringify([
          {
            name: 'riotId',
            label: 'Riot ID',
            type: 'text',
            placeholder: 'ตัวอย่าง: PlayerName#1234',
            required: true,
            description: 'Riot ID ของคุณ (ชื่อผู้เล่น + Tag)'
          }
        ]),
        packages: JSON.stringify([
          { name: '650 RP', amount: 650, price: 125, isPopular: false },
          { name: '1380 RP', amount: 1380, price: 250, isPopular: true },
          { name: '2800 RP', amount: 2800, price: 500, isPopular: false },
          { name: '5000 RP', amount: 5000, price: 875, isPopular: false }
        ]),
        instructions: 'วิธีหา Riot ID: เปิดเกม League of Legends > ไปที่ Settings > General > คัดลอก Riot ID ที่แสดงด้านบน',
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'genshin',
        displayName: 'Genshin Impact',
        description: 'เกม Action RPG โลกเปิดสุดอลังการ',
        category: 'mobile',
        image: '/images/genshin.jpg',
        accountFields: JSON.stringify([
          {
            name: 'uid',
            label: 'UID',
            type: 'text',
            placeholder: 'ตัวอย่าง: 123456789',
            required: true,
            description: 'UID ของคุณในเกม Genshin Impact'
          },
          {
            name: 'server',
            label: 'Server',
            type: 'select',
            options: [
              { value: 'asia', label: 'Asia' },
              { value: 'america', label: 'America' },
              { value: 'europe', label: 'Europe' },
              { value: 'cht', label: 'TW/HK/MO' }
            ],
            required: true,
            description: 'เซิร์ฟเวอร์ที่คุณเล่น'
          }
        ]),
        packages: JSON.stringify([
          { name: '60 เจเนซิส คริสตัล', amount: 60, price: 31, isPopular: false },
          { name: '300 เจเนซิส คริสตัล', amount: 300, price: 155, isPopular: true },
          { name: '980 เจเนซิส คริสตัล', amount: 980, price: 500, isPopular: false },
          { name: '1980 เจเนซิส คริสตัล', amount: 1980, price: 1000, isPopular: false }
        ]),
        instructions: 'วิธีหา UID: เปิดเกม Genshin Impact > กด Menu > Settings > Account > UID จะแสดงด้านล่าง',
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Games', {
      name: ['valorant', 'rov', 'freefire', 'pubgm', 'lol', 'genshin']
    }, {})
  }
}