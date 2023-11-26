// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authHandler = require('../routesHandler/authHandler');


// 钉钉登录
router.post('/login', authHandler.login);

// 安卓平台登录成功回调app
router.get('/callback', authHandler.callback);

module.exports = router;
