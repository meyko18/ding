// db/locations.js
const connection = require('./index');


// 保存位置信息
const saveLocation = (user_id, latitude, longitude) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO locations (user_id, latitude, longitude) VALUES (?, ?, ?)';
        connection.query(query, [user_id, latitude, longitude], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// 获取某个人某一天的行动轨迹
const getUserLocationsForDate = (user_id, date) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT latitude, longitude, timestamp 
            FROM locations 
            WHERE user_id = ? AND DATE(timestamp) = ?
            ORDER BY timestamp ASC
        `;
        connection.query(query, [user_id, date], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};


module.exports = {
    saveLocation,
    getUserLocationsForDate
};
