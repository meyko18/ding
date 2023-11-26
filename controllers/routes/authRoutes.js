// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authHandler = require('../routesHandler/authHandler');

router.post('/login', authHandler.login);
router.get('/callback', authHandler.callback);

module.exports = router;
