const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;
const config = require('./config')
const db = require('./db/index'); // 导入数据库模块

const initializeDatabase = require('./db/init'); // 导入数据库初始化模块


const { handleErrors, handleNotFound } = require('./middleware/errorHandler');

// 初始化数据库
initializeDatabase().then(() => {
    console.log('Database initialization completed.');
}).catch((error) => {
    console.error('Error during database initialization:', error);
});

// 使用CORS中间件
const cors = require('cors');
app.use(cors());

// 使用中间件来解析JSON请求体
app.use(express.json());
app.use(express.json({ limit: '100kb' }))

app.use(bodyParser.json());


//配置解析token的中间件
const { expressjwt: expressjwt } = require('express-jwt')
//开发阶段，为了方便测试接口，可以不配置解析token的中间件，后期打开，进行接口的安全性测试
const jwtSecret = config.jwtSecretKey
app.use(expressjwt({ secret: jwtSecret, 
  algorithms: ['HS256']
 }).unless({ path: [
          /^\/auth\//,
          /^\/ding\//
        ] }));



// 使用钉钉免登路由
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// 使用钉钉路由
const dingRoutes = require('./routes/dingRoutes');
app.use('/ding', dingRoutes);

// 使用签到路由
const signRoutes = require('./routes/signRoutes');
app.use('/sign', signRoutes);

// 使用位置路由
const locationRoutes = require('./routes/locationRoutes');
app.use('/location', locationRoutes);


// 捕获404错误并转发给错误处理器
app.use(handleNotFound);

// 通用错误处理中间件
app.use(handleErrors);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
