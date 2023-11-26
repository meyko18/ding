// signHandler.js

const jwt = require('jsonwebtoken');
const config = require('../config');
const { addCheckIn, findCheckInToday, findSignOutToday } = require('../db/sign');


// 签到
exports.handleSignInOut = async (req, res) => {
    console.log('handleSignInOut');
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecretKey);
        const userId = decoded.userId;

        const { type, latitude, longitude, isFieldwork } = req.body;

        let checkInRecords;
        if (type === "SignIn") {
            // 检查用户是否已经签到
            checkInRecords = await findCheckInToday(userId);
        } else if (type === "SignOut") {
            // 检查用户是否已经签退
            checkInRecords = await findSignOutToday(userId);
        }

        if (checkInRecords && checkInRecords.length > 0) {
            res.status(400).json({ 
                success: false,
                message: type === "SignIn" ? "你今天已经签到了!" : "你今天已经签退了!"
            });
            return;
        }

        await addCheckIn(userId, type, latitude, longitude, isFieldwork);
        const signTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });

        res.status(200).json({ 
            success: true,
            message: type === "SignIn" ? "签到成功!" : "签退成功!",
            signTime 
        });
    } catch (error) {
        console.error('Error during sign in/out:', error);
        res.status(500).json({ 
            success: false,
            message: "操作出现问题，请稍后重试" 
        });
    }
};


