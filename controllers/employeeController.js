// employeesController.js
const axios = require('axios');
const config = require('../config'); // 引入配置文件
const employees = require('../db/employees');
const locations = require('../db/locations');

let accessToken = null;



// 获取所有员工
const getAllEmployees = async (req, res) => {
    try {
      // Query the employees table
      const rows = await employees.getAll();
      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
  };


// 获取特定员工的位置记录
const getEmployeeLocation = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecretKey);
        const userId = decoded.userId;
        const employee = await employees.getByUserId(userId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const locationRecords = await locations.getByEmployeeId(employee.employee_id);
        res.json({
            success: true,
            data: locationRecords
        });
    } catch (error) {
        console.error("Error fetching employee's location:", error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};




const getAccessToken = async () => {
    if (!accessToken) {
        const response = await axios.get(`${config.dingtalk.DINGTALK_API_BASE}/gettoken?appkey=${config.dingtalk.DINGTALK_APPKEY}&appsecret=${config.DINGTALK_APPSECRET}`);
        accessToken = response.data.access_token;
    }
    return accessToken;
};

const getEmployeeLocationFromDingtalk = async (dingtalkId) => {
    const token = await getAccessToken();
    // 调用钉钉的位置API（这里只是一个示例，您需要查找正确的API和参数）
    const response = await axios.get(`${config.dingtalk.DINGTALK_API_BASE}/api_to_get_location?access_token=${token}&userid=${dingtalkId}`);
    return response.data.location;
};


// 添加新员工
const addEmployee = (req, res) => {
    const { name, dingtalk_id, role } = req.body;
    if (!name || !dingtalk_id || !role) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    db.employees.add(name, dingtalk_id, role)
        .then((result) => {
            res.json({ message: 'Employee added successfully.', id: result.insertId });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error adding employee.' });
        });
};

const fetchAllEmployeeLocations = async () => {
    try {
        // 使用钉钉API获取所有员工列表
        const dingtalkEmployees = await getDingtalkEmployeeList();

        for (let employee of dingtalkEmployees) {
            // 检查员工是否已经在数据库中
            const existingEmployee = await db.employees.getByDingtalkId(employee.dingtalkId);

            // 如果员工不在数据库中，则将他们添加到数据库
            if (!existingEmployee) {
                await db.employees.add(employee.name, employee.dingtalkId, employee.role);
            }

            // 使用钉钉API或其他方法获取员工位置
            const location = await getEmployeeLocationFromDingtalk(employee.dingtalkId);
            
            // 更新数据库中的员工位置
            await db.locations.updateLocation(employee.id, location);
        }
    } catch (error) {
        console.error("Error fetching employee locations:", error);
    }
};


module.exports = {
    getAllEmployees,
    getEmployeeLocation,
    addEmployee,
    fetchAllEmployeeLocations
    // ... 其他导出的操作 ...
};
