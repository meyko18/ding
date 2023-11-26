// routes/signRoutes.js
const express = require('express');
const router = express.Router();
const signHandler = require('../routesHandler/signHandler');

// 签到的路由
router.post('/signin', signHandler.handleSignInOut);


module.exports = router;
