const axios = require('axios');
const config = require('../config');
const jwt = require('jsonwebtoken');
const DingTalkEncryptor = require('dingtalk-encrypt');
const utils = require('dingtalk-encrypt/Utils');
const employees = require('../db/employees');

const TOKEN = config.dingtalk.TOKEN;
const ENCODING_AES_KEY = config.dingtalk.ENCRYPTION_KEY
const DINGTALK_APPKEY = config.dingtalk.DINGTALK_APPKEY; // 请确保这是您的CORP_ID

const IV_LENGTH = 16; // AES block size

const encryptor = new DingTalkEncryptor(TOKEN, ENCODING_AES_KEY, DINGTALK_APPKEY);

exports.login = async (req, res) => {
    // console.log('req.body', req.body);
    const authCode = req.body.authCode;
    console.log('authCode', authCode);
    try {
        // 1. 获取常规access_token
        const access_token = await getAccessToken(authCode);
        console.log('access_token', access_token);

        // 2. 获取企业的access_token
        const corp_access_token = await getCorpAccessToken();

        // 3. 获取用户信息
        const userInfo = await getUserInfo(access_token, authCode);
        // console.log('userInfo', userInfo);
        /*
        userInfo {
           nick: '陈明',
           unionId: 'uXm2j7YFK9RaqR1riPTUnygiEiE',
           avatarUrl: 'https://static-legacy.dingtalk.com/media/lADPBFuNakzkg2nNAUDNAUA_320_320.jpg',
           openId: 'yQ6iSgZ04OA3pceBUvUPQuwiEiE',
           mobile: '13766324410',
           stateCode: '86'
         }
        */
       // 4. 获取用户userid
       const unionId = userInfo.unionId;
       const userId = await getUserByUnionId(corp_access_token, unionId);
    //    console.log('userId', userId);
        //分割线------------------------
        
        // 4. 获取用户详情
        const userDetails = await getUserDetails(corp_access_token, userId);
        console.log('userDetails', userDetails);
        /*
        userDetails {
           active: true,
           admin: true,
           avatar: 'https://static-legacy.dingtalk.com/media/lADPBFuNakzkg2nNAUDNAUA_320_320.jpg',
           boss: false,
           dept_id_list: [ 1 ],
           dept_order_list: [ { dept_id: 1, order: 176227280487221500 } ],
           email: '',
           exclusive_account: false,
           hide_mobile: false,
           leader_in_dept: [ { dept_id: 1, leader: false } ],
           mobile: '13766324410',
           name: '陈明',
           real_authed: true,
           role_list: [ { group_name: '默认', id: 3833463889, name: '主管理员' } ],
           senior: false,
           state_code: '86',
           unionid: 'uXm2j7YFK9RaqR1riPTUnygiEiE',
           userid: 'manager5781'
         }
        */

        // 5. 将用户信息添加到数据库中
        await employees.handleLogin(userDetails);
        
        // 6.生成JWT
        const token = jwt.sign({ userId: userDetails.userid}, config.jwtSecretKey, { expiresIn: '7d' });

        // 打包用户详细信息和JWT
        const response = {
            userDetails: userDetails,
            token: token
        };
        // 发送响应
        res.json(response);

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error.');
    }
}


// 1. 获取常规access_token
async function getAccessToken(authCode) {
    const appKey = config.dingtalk.DINGTALK_APPKEY; // 替换为您的appKey
    const appSecret = config.dingtalk.DINGTALK_APPSECRET; // 替换为您的appSecret

    const response = await axios.post('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', {
            clientId: appKey,
            clientSecret: appSecret,
            code: authCode,
            grantType: 'authorization_code'
        });

    if (response.data && response.data.accessToken) {
        return response.data.accessToken;
    } else {
        throw new Error('Failed to get access token from DingTalk');
    }
}


//2. 获取用户基本信息
async function getUserInfo(accessToken) {

    // console.log('accessToken', accessToken);
    const url = `https://api.dingtalk.com/v1.0/contact/users/me`;

    const response = await axios.get(url, {
        headers: {
            'x-acs-dingtalk-access-token': accessToken
        }
    });

    if (response.data) {
        return response.data;
    } else {
        throw new Error('Failed to get user info from DingTalk');
    }
}

// 3. 获取企业的access_token
async function getCorpAccessToken() {

    const appkey = config.dingtalk.DINGTALK_APPKEY; // 替换为您的appKey
    const appsecret = config.dingtalk.DINGTALK_APPSECRET; // 替换为您的appSecret

    const url = `https://oapi.dingtalk.com/gettoken?appkey=${appkey}&appsecret=${appsecret}`;

    const response = await axios.get(url);
    // console.log('response', response);

    if (response.data.access_token) {
        return response.data.access_token;
    } else {
        throw new Error('Failed to get token from DingTalk');
    }
}

// 4. 获取用户userid，通过unionid
async function getUserByUnionId(accessToken, unionid) {
    // console.log('accessToken', accessToken);

    const url = `https://oapi.dingtalk.com/topapi/user/getbyunionid?access_token=${accessToken}`;

    const response = await axios.post(url, {
        unionid: unionid
    });

    if (response.data.result) {
        return response.data.result.userid;
    } else {
        throw new Error('Failed to get user by unionid from DingTalk');
    }
}


// 5. 获取用户详情
async function getUserDetails(accessToken, userId) {
    const url = `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${accessToken}`;

    const response = await axios.post(url, {
        userid: userId
    });

    if (response.data && response.data.result) {
        return response.data.result;
    } else {
        throw new Error('Failed to get user details from DingTalk');
    }
}



// 安卓端使用的回调
exports.callback = async (req, res) => {

    const authCode = req.query.authCode;

    // 返回一个HTML页面，其中的JavaScript会打开你的应用的深度链接并传递授权码
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Redirecting...</title>
        </head>
        <body>
            <script>
                var deepLink = 'myapp://callback?code=${authCode}';
                window.location = deepLink;
            </script>
        </body>
        </html>
    `;

    res.send(html);
}

