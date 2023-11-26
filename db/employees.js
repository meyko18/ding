const connection = require('./index');

// 获取所有员工信息
const getAll = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM employees';
        connection.query(query, (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

// 添加新员工
const add = (name, user_id, role, phone_number, avatar_url) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO employees (name, user_id, role, phone_number, avatar_url) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [name, user_id, role, phone_number, avatar_url], (err, result) => {
            if (err) {
                // 检查是否是因为重复的user_id或phone_number引起的错误
                if (err.code === 'ER_DUP_ENTRY') {
                    reject(new Error('User ID or phone number already exists.'));
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

// 根据user_id查找员工
const findByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM employees WHERE user_id = ?';
        connection.query(query, [user_id], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

// 更新员工信息
const update = (name, user_id, role, phone_number, avatar_url) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE employees SET name = ?, role = ?, phone_number = ?, avatar_url = ? WHERE user_id = ?';
        connection.query(query, [name, role, phone_number, avatar_url, user_id], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// 登录后的数据库操作
const handleLogin = async (userDetails) => {
    const name = userDetails.name;
    const user_id = userDetails.userid;
    const role = userDetails.boss ? 'Boss' : 'Employee';  // 注意: 我基于您提供的userDetails格式更改了角色判断逻辑
    const phone_number = userDetails.mobile;
    const avatar_url = userDetails.avatar;

    // 检查该用户是否已存在
    const existingUser = await findByUserId(user_id);

    if (existingUser.length === 0) {
        // 如果用户不存在，则添加新用户
        return add(name, user_id, role, phone_number, avatar_url);
    } else {
        // 如果用户已存在，则更新用户信息
        return update(name, user_id, role, phone_number, avatar_url);
    }
};

// 根据user_id获取员工信息
const getByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM employees WHERE user_id = ?';
        connection.query(query, [user_id], (err, results) => {
            if (err) reject(err);
            if (results.length) {
                resolve(results[0]); // 返回第一个匹配的员工
            } else {
                resolve(null);
            }
        });
    });
};

module.exports = {
    getAll,
    add,
    findByUserId,
    update,
    handleLogin,
    getByUserId
};
