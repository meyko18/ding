// dingRoutes.js

const express = require('express');
const router = express.Router();
const dingController = require('../controllers/dingController');

router.get('/getOAuthUrl', dingController.getOAuthUrl);
router.post('/exchangeCode', dingController.exchangeCodeForAccessToken);
router.get('/getUserInfo', dingController.getUserInfo);

module.exports = router;
