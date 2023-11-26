// routes/employeeRoutes.js

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// 获取所有员工的信息
router.get('/getAllEmployees', employeeController.getAllEmployees);

// 获取特定员工的位置记录
router.get('/getEmployeeLocation', employeeController.getEmployeeLocation);

// 添加新员工
router.post('/add', employeeController.addEmployee);

// ... 其他路由 ...

module.exports = router;
