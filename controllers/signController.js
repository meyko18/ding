const config = require('../config');
const locations = require('../db/locations');
const sign = require('../db/sign');
const jwt = require('jsonwebtoken');

const { calculateDistance } = require('./utils');

const allowedDistance = config.location.ALLOWED_DISTANCE;
const companyLatitude = config.location.COMPANY_LATITUDE;
const companyLongitude = config.location.COMPANY_LONGITUDE;

const handleEmployeeSignIn = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecretKey);
    const userId = decoded.userId;

    const latitude = req.body.latitude;
    const longitude = req.body.longitude;

    const distance = calculateDistance(latitude, longitude, companyLatitude, companyLongitude);
    if (distance > allowedDistance) {
        return res.json({ message: 'Sign-in failed, not in the sign-in range', status: 'notRange' });  // 返回签到状态给前端
    }

    const hour = new Date().getHours();
    let signType;
    let signInStatus;  // 新增变量，用于存储签到状态

    if (hour >= config.signInTimes.morning.start && hour < config.signInTimes.morning.end) {
        signType = 'morning_sign_in_time';
        signInStatus = hour <= config.signInTimes.morning.late ? 'signed' : 'late';  // 根据时间判断签到状态
    } else if (hour >= config.signInTimes.afternoon.start && hour < config.signInTimes.afternoon.end) {
        signType = 'afternoon_sign_in_time';
        signInStatus = hour <= config.signInTimes.afternoon.late ? 'signed' : 'late';  // 根据时间判断签到状态
    } else {
        return res.status(400).send('Not a valid sign-in time.');
    }

    try {
        await locations.insertLocation(userId, latitude, longitude);
        const records = await sign.checkSignRecordForToday(userId);

        if (!records) {
            await sign.insertSignRecord(userId, signType);
        } else {
            await sign.updateSignRecord(userId, signType);
        }

        res.json({ message: 'Sign in successful', status: signInStatus });  // 返回签到状态给前端

    } catch (error) {
        console.error('Error during sign in:', error);
        res.status(500).send('Internal server error.');
    }
};


const handleEmployeeSignOut = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecretKey);
    const userId = decoded.userId;

    const latitude = req.body.latitude;
    const longitude = req.body.longitude;

    const hour = new Date().getHours();
    let signType;

    if (hour >= config.signOutTimes.morning.start && hour < config.signOutTimes.morning.end) {
        signType = 'morning_sign_out_time';
    } else if (hour >= config.signOutTimes.afternoon.start && hour < config.signOutTimes.afternoon.end) {
        signType = 'afternoon_sign_out_time';
    } else {
        return res.status(400).send('Not a valid sign-out time.');
    }

    try {
        await locations.insertLocation(userId, latitude, longitude);
        const records = await sign.checkSignRecordForToday(userId);

        if (records.length !== 0) {
            await sign.updateSignRecord(userId, signType);
            res.json({ message: 'Sign out successful' });
        } else {
            res.status(400).send('No sign in record found for today.');
        }

    } catch (error) {
        console.error('Error during sign out:', error);
        res.status(500).send('Internal server error.');
    }
};

const handleGetSignStatus = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecretKey);
        const userId = decoded.userId;
        const hour = new Date().getHours();

        const signRecord = await sign.checkSignRecordForToday(userId);
        if (signRecord) {
            if (hour >= config.signInTimes.morning.start && hour < config.signInTimes.morning.end) {
                if (signRecord.morning_sign_in_time) {
                    return res.json({ status: 'signed' });
                } else {
                    return res.json({ status: 'notSigned' });
                }
            } else if (hour >= config.signInTimes.afternoon.start && hour < config.signInTimes.afternoon.end) {
                if (signRecord.afternoon_sign_in_time) {
                    return res.json({ status: 'signed' });
                } else {
                    return res.json({ status: 'notSigned' });
                }
            } else {
                return res.json({ status: 'late' });
            }
        } else {
            if (hour < config.signInTimes.morning.start || (hour >= config.signInTimes.morning.end && hour < config.signInTimes.afternoon.start)) {
                return res.json({ status: 'notSigned' });
            } else {
                return res.json({ status: 'late' });
            }
        }
    } catch (error) {
        console.error('Error fetching sign status:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};








module.exports = {
    handleEmployeeSignIn,
    handleEmployeeSignOut,
    handleGetSignStatus
};
