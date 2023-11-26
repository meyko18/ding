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
        // 2. 获取access_token
        
        const access_token = await getAccessToken(authCode);
        console.log('access_token', access_token);

        // 3. 获取用户userid
        const userInfo = await getUserInfo(access_token, authCode);
        console.log('userInfo', userInfo);
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

        //分割线------------------------
        
        

        const userId = userInfo.userid;
        // 4. 获取用户详情
        const userDetails = await getUserDetails(access_token, userId);
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
        await employees.handleLogin(userInfo, userDetails);
        
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



// exports.login = async (req, res) => {
//     console.log('req.body', req.body);
//     const AuthCode = req.body.authCode;
//     try {
//         // 2. 获取access_token
//         const access_token = await getAccessToken();

//         // 3. 获取用户userid
//         const userInfo = await getUserInfo(access_token, AuthCode);
//         /*
//         userInfo {
//             device_id: '3eb81a521a137429e7ea664ffbc50e94',
//             name: '陈明',
//             sys: true,
//             sys_level: 1,
//             unionid: 'uXm2j7YFK9RaqR1riPTUnygiEiE',
//             userid: 'manager5781'
//         }
//         */
//         const userId = userInfo.userid;
//         // 4. 获取用户详情
//         const userDetails = await getUserDetails(access_token, userId);
//         /*
//         userDetails {
//             active: true,
//             admin: true,
//             avatar: 'https://static-legacy.dingtalk.com/media/lADPBFuNakzkg2nNAUDNAUA_320_320.jpg',
//             boss: false,
//             dept_id_list: [ 1 ],
//             dept_order_list: [ { dept_id: 1, order: 176227280487221500 } ],
//             email: '',
//             exclusive_account: false,
//             hide_mobile: false,
//             leader_in_dept: [ { dept_id: 1, leader: false } ],
//             mobile: '13766324410',
//             name: '陈明',
//             real_authed: true,
//             role_list: [ { group_name: '默认', id: 3833463889, name: '主管理员' } ],
//             senior: false,
//             state_code: '86',
//             unionid: 'uXm2j7YFK9RaqR1riPTUnygiEiE',
//             userid: 'manager5781'
//         }
//         */

//         // 5. 将用户信息添加到数据库中
//         await employees.handleLogin(userInfo, userDetails);
        
//         // 6.生成JWT
//         const token = jwt.sign({ userId: userDetails.userid}, config.jwtSecretKey, { expiresIn: '7d' });

//         // 打包用户详细信息和JWT
//         const response = {
//             userDetails: userDetails,
//             token: token
//         };
//         // 发送响应
//         res.json(response);

//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(500).send('Internal server error.');
//     }
// }


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

async function getUserInfo(accessToken, authCode) {
    console.log('accessToken', accessToken);

    const url = `https://api.dingtalk.com/v1.0/oauth2/ssoUserInfo?code=${authCode}`;

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

// async function getUserInfo(accessToken) {

//     console.log('accessToken', accessToken);
//     const url = `https://api.dingtalk.com/v1.0/contact/users/me`;

//     const response = await axios.get(url, {
//         headers: {
//             'x-acs-dingtalk-access-token': accessToken
//         }
//     });

//     if (response.data) {
//         return response.data;
//     } else {
//         throw new Error('Failed to get user info from DingTalk');
//     }
// }


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


// exports.callback = async (req, res) => {
//     const encryptedData = req.body.encrypt;
//     const signature = req.query.signature;
//     const timestamp = req.query.timestamp;
//     const nonce = req.query.nonce;
//     try {
//         const plainText = encryptor.getDecryptMsg(signature, timestamp, nonce, encryptedData);
//         console.log('Decrypted Data: ', plainText);

//         const obj = JSON.parse(plainText);
//         const eventType = obj.EventType;

//         if (eventType && eventType.includes('<suiteTicket>')) {
//             const suiteTicket = extractSuiteTicket(plainText);
//             saveSuiteTicket(suiteTicket);
//         }

//         const encryptedResponse = encryptor.getEncryptedMap('success', timestamp, utils.getRandomStr(8));
//         console.log('Encrypted Response: ', encryptedResponse);
//         const response = {
//             msg_signature: encryptedResponse.msg_signature,
//             timeStamp: encryptedResponse.timeStamp,
//             nonce: encryptedResponse.nonce,
//             encrypt: encryptedResponse.encrypt
//         };
//         res.json(response);

//     } catch (error) {
//         console.error('Decryption error:', error);
//         res.status(500).send('Error decrypting data');
//     }
// };

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

