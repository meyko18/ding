const { saveLocation } = require('../db/locations');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { simplifyPath } = require('./utils');
const { getUserLocationsForDate } = require('../db/locations');


// 定时上传位置的接口
exports.uploadLocation = async (req, res) => {
    console.log('11 req.body', req.body);
    try {

        const { latitude, longitude } = req.body;
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecretKey);
        const user_id = decoded.userId;
        
        await saveLocation(user_id, latitude, longitude);

        res.status(200).json({ success: true, message: 'Location saved successfully' });
    } catch (error) {
        console.error('Error saving location:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// 获取某个人某一天的行动轨迹
exports.getDailyTrajectory = async (req, res) => {
    console.log('获取轨迹...');
    try {
        const { date } = req.body;

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecretKey);
        const user_id = decoded.userId;
        
        const rawTrajectory = await getUserLocationsForDate(user_id, date);
        const simplifiedTrajectory = simplifyPath(rawTrajectory, 0.0001); // 0.0001作为容差值
        
        // 转换格式以适配高德地图
        const amapFormattedTrajectory = simplifiedTrajectory.map(point => [point.longitude, point.latitude]);

        console.log('amapFormattedTrajectory', amapFormattedTrajectory);
        res.status(200).json({ success: true, trajectory: amapFormattedTrajectory });
    } catch (error) {
        console.error('Error fetching trajectory:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};