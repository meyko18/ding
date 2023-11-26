const crypto = require('crypto');
const config = require('../config');

const AES_KEY = Buffer.from(config.dingtalk.ENCRYPTION_KEY, 'base64');
const IV_LENGTH = 16; // AES block size
const TOKEN = config.dingtalk.TOKEN;



/**
 * 加密给定的文本。
 * @param {string} text - 要加密的文本。
 * @return {string} 返回加密后的文本。
 */
function encrypt(msg) {
    const random = crypto.randomBytes(16);
    const msgBuffer = Buffer.from(msg);
    const msgLength = Buffer.alloc(4);
    msgLength.writeUInt32BE(msgBuffer.length, 0);

    const toEncrypt = Buffer.concat([random, msgLength, msgBuffer, AES_KEY]);

    const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, AES_KEY.slice(0, 16));
    let encrypted = cipher.update(toEncrypt);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('base64');
}

/**
 * 解密给定的文本。
 * @param {string} text - 要解密的文本。
 * @return {string} 返回解密后的文本。
 */
function decrypt(encryptedMsg) {
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, AES_KEY.slice(0, 16));
        let decrypted = decipher.update(Buffer.from(encryptedMsg, 'base64'));
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        const msgLength = decrypted.subarray(16, 20).readUInt32BE(0);
        const msg = decrypted.subarray(20, 20 + msgLength).toString();

        return msg;
    } catch (error) {
        console.error("Decryption error:", error);
        return null; // 或者您可以选择抛出错误，取决于您的错误处理策略
    }
}

/**
 * 从给定的数据中提取suiteTicket。
 * @param {string} data - 包含suiteTicket的数据。
 * @return {string|null} 返回suiteTicket或null。
 */
function extractSuiteTicket(data) {
    const match = /<suiteTicket>(.*?)<\/suiteTicket>/.exec(data);
    return match ? match[1] : null;
}

// 这是一个简单的内存存储，用于保存suiteTicket。
// 在实际应用中，您可能需要使用数据库或其他持久化方法。
let suiteTicketStorage = '';

/**
 * 保存给定的suiteTicket。
 * @param {string} suiteTicket - 要保存的suiteTicket。
 */
function saveSuiteTicket(suiteTicket) {
    suiteTicketStorage = suiteTicket;
}

// 使用Haversine公式计算两个经纬度之间的距离
/**
 * * @param {number} lat1 - 第一个点的纬度。
    * @param {number} lon1 - 第一个点的经度。
    * @param {number} lat2 - 第二个点的纬度。
    * @param {number} lon2 - 第二个点的经度。
    * @return {number} 返回两个点之间的距离，单位：米。
*/
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球半径，单位：米
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}


module.exports = {
    encrypt,
    decrypt,
    extractSuiteTicket,
    saveSuiteTicket,
    calculateDistance
};
