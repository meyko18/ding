// dingController.js

const axios = require('axios');
const config = require('../config');

const YOUR_APP_ID = config.dingtalk.DINGTALK_APPKEY; //应用的AppKey
const YOUR_SERVER_CALLBACK_URL = encodeURIComponent(config.dingtalk.redirectURI); //授权后的回调地址，这里我增加了URL编码以确保其安全地嵌入到URL中
const SCOPE = "openid";  //授权范围，这里我只使用了“openid”，你可以按需修改

exports.getOAuthUrl = (req, res) => {
    const state = Math.random().toString(36).substring(7); //生成一个随机的state字符串
    const url = `https://login.dingtalk.com/oauth2/auth?redirect_uri=${YOUR_SERVER_CALLBACK_URL}&response_type=code&client_id=${YOUR_APP_ID}&scope=${SCOPE}&state=${state}&prompt=consent`;
    
    console.log('Generated OAuth URL:', url);
    res.json({ oauthUrl: url });
};

exports.exchangeCodeForAccessToken = async (req, res) => {
    const { code } = req.body;
    try {
        const response = await axios.get(`https://oapi.dingtalk.com/sns/gettoken?appid=${YOUR_APP_ID}&appsecret=${YOUR_APP_SECRET}`);
        const { access_token } = response.data;

        // You may want to store this access_token in the database associated with the user

        res.json({ access_token });
    } catch (error) {
        res.status(500).json({ error: 'Failed to exchange code for access token' });
    }
};

exports.getUserInfo = async (req, res) => {
    const { access_token } = req.query;
    try {
        const response = await axios.get(`YOUR_ENDPOINT_TO_GET_USER_INFO`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
};
