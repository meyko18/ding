const connection = require('./index');

// 添加新打卡记录
const addCheckIn = (user_id, type, latitude, longitude, isFieldwork) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO checkins (user_id, type, latitude, longitude, is_fieldwork) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [user_id, type, latitude, longitude, isFieldwork], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};


// 根据用户ID获取打卡记录
const getCheckInsByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM checkins WHERE user_id = ?';
        connection.query(query, [user_id], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

// 删除打卡记录（如果有这样的需求）
const deleteCheckIn = (user_id, timestamp) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM checkins WHERE user_id = ? AND timestamp = ?';
        connection.query(query, [user_id, timestamp], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// 获取指定日期范围内的打卡记录
const getCheckInsByDateRange = (user_id, startDate, endDate) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM checkins WHERE user_id = ? AND timestamp BETWEEN ? AND ?';
        connection.query(query, [user_id, startDate, endDate], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};


// 查询用户当日的签到记录
const findCheckInToday = (user_id) => {
    const today = new Date().toISOString().slice(0, 10);
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM checkins WHERE user_id = ? AND DATE(timestamp) = ?';
        connection.query(query, [user_id, today], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

// 寻找今日的签退记录
const findSignOutToday = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM checkins WHERE user_id = ? AND DATE(timestamp) = CURDATE() AND type="SignOut"';
        connection.query(query, [user_id], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};


module.exports = {
    addCheckIn,
    getCheckInsByUserId,
    deleteCheckIn,
    getCheckInsByDateRange,
    findCheckInToday,
    findSignOutToday
};