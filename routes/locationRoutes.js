// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const locationHandler = require('../routesHandler/locationHandler');

// 上传位置信息
router.post('/uploadLocation', locationHandler.uploadLocation);

// 获取某个人某一天的行动轨迹
router.post('/getDailyTrajectory', locationHandler.getDailyTrajectory);


module.exports = router;
