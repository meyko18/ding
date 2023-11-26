// routes/locationRoutes.js

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// 获取所有员工的位置
router.get('/', locationController.getAllLocations);

// 获取特定员工的位置
router.get('/:employee_id', locationController.getLocationByEmployeeId);

// 为员工添加位置
router.post('/add', locationController.addLocation);

// 上传员工位置
router.post('/upload', locationController.handleUploadLocation);

module.exports = router;
