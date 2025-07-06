// services/gameService.js
const axios = require('axios')

class GameService {
    // เติมเงิน VALORANT
    async topupValorant(gameId, amount) {
        try {
            // ตัวอย่าง API call (จริงต้องมี API ของ Riot)
            const response = await axios.post('https://api.riotgames.com/topup', {
                gameId,
                amount,
                apiKey: process.env.RIOT_API_KEY
            })

            return {
                success: true,
                transactionId: response.data.transactionId
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // เติมเงิน PUBG Mobile
    async topupPubg(playerId, amount) {
        try {
            // ตัวอย่าง API call
            const response = await axios.post('https://api.pubgmobile.com/topup', {
                playerId,
                amount,
                apiKey: process.env.PUBG_API_KEY
            })

            return {
                success: true,
                transactionId: response.data.transactionId
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // ฟังก์ชันหลักสำหรับเติมเงิน
    async processTopup(gameName, gameAccount, amount) {
        switch (gameName) {
            case 'valorant':
                return await this.topupValorant(gameAccount.gameId, amount)
            case 'pubg':
                return await this.topupPubg(gameAccount.playerId, amount)
            default:
                return { success: false, error: 'ไม่รองรับเกมนี้' }
        }
    }
}

module.exports = new GameService()