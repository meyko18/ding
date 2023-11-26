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


