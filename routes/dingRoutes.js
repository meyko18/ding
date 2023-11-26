// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const dingHandler = require('../routesHandler/dingHandler');

// 获取钉钉免登授权登录链接
router.get('/getOAuthUrl', dingHandler.getOAuthUrl);

module.exports = router;
