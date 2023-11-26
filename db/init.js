// db/init.js
const db = require('./index');

const initialize = async () => {
    try {
        await db.query('CREATE DATABASE IF NOT EXISTS DingtalkApp');
        console.log('Database created or already exists.');

        await db.query('USE DingtalkApp');

        const createEmployeesTable = `
            CREATE TABLE IF NOT EXISTS employees (
                employee_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                user_id VARCHAR(255) UNIQUE NOT NULL, -- 从钉钉获取的用户ID
                role ENUM('Boss', 'Employee') NOT NULL,
                phone_number VARCHAR(15) UNIQUE NOT NULL,
                avatar_url VARCHAR(512)
            )
        `;
        await db.query(createEmployeesTable);
        console.log('Employees table created or already exists.');

        const createLocationsTable = `
            CREATE TABLE IF NOT EXISTS locations (
                location_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                latitude DECIMAL(10, 8) NOT NULL,
                longitude DECIMAL(11, 8) NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES employees(user_id)
            )
        `;
        await db.query(createLocationsTable);
        console.log('Locations table created or already exists.');

        const createCheckInsTable = `
            CREATE TABLE IF NOT EXISTS checkins (
                checkin_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                type ENUM('SignIn', 'SignOut') NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                latitude DECIMAL(10, 8) NOT NULL,
                longitude DECIMAL(11, 8) NOT NULL,
                is_fieldwork BOOLEAN NOT NULL,
                FOREIGN KEY (user_id) REFERENCES employees(user_id)
            )
        `;
        await db.query(createCheckInsTable);
        console.log('CheckIns table created or already exists.');

    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

module.exports = initialize;
