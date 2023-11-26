// controllers/locationController.js
const db = require('../db');
const { insertLocation } = require('../db/locations');
const jwt = require('jsonwebtoken');
const config = require('../config');
// 获取所有员工的位置
const getAllLocations = (req, res) => {
    db.locations.getAll()
        .then((locations) => {
            res.json(locations);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error fetching locations.' });
        });
};

// 获取特定员工的位置
const getLocationByEmployeeId = (req, res) => {
    const employee_id = req.params.employee_id;
    db.locations.getByEmployeeId(employee_id)
        .then((locations) => {
            if (locations.length === 0) {
                return res.status(404).json({ error: 'No locations found for this employee.' });
            }
            res.json(locations);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error fetching location.' });
        });
};

// 为员工添加位置
const addLocation = (req, res) => {
    const { employee_id, latitude, longitude } = req.body;
    if (!employee_id || !latitude || !longitude) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    db.locations.add(employee_id, latitude, longitude)
        .then((result) => {
            res.json({ message: 'Location added successfully.', id: result.insertId });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error adding location.' });
        });
};

// 上传员工位置
const handleUploadLocation = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecretKey);
        const userId = decoded.userId;

        const latitude = req.body.latitude;
        const longitude = req.body.longitude;
        // console.log('okkkkkkkkk');
        // 使用帮助函数插入位置到locations表中
        insertLocation(userId, latitude, longitude, (error, results) => {
            if (error) {
                console.error('Error inserting location:', error);
                return res.status(500).send('Internal server error.');
            } else {
                return res.json({ message: 'Location uploaded successfully' });
            }
        });
    } catch (error) {
        console.error('Error uploading location:', error);
        return res.status(500).send('Internal server error.');
    }
};


module.exports = {
    getAllLocations,
    getLocationByEmployeeId,
    addLocation,
    handleUploadLocation
    // ... 其他导出的操作 ...
};
