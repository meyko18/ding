// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const signController = require('../controllers/signController');

// 签到的路由
router.post('/signIn', signController.handleEmployeeSignIn);

// 签退的路由
router.post('/signOut', signController.handleEmployeeSignOut);

// 获取签到记录
router.get('/status', signController.handleGetSignStatus);


module.exports = router;
