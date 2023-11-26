// config.js

module.exports = {
    mysql: {
        host: 'localhost',
        user: 'root',
        password: 'Admin123..',
        database: 'DingtalkApp'
    },
    // 钉钉OAuth配置
    dingtalk: {
        appID: '5000000004841045',
        appSecret: 'VKK70qfwrqJyEm2ZW3nmUMhFk30cjR5t7Q9qNoa0R69Z7cAV5PbHS9nJ6thOMGDW',
        // redirectURI: 'http://110.40.133.250:3000/auth/callback',
        redirectURI: 'http://110.40.133.250:3000/auth/callback',
        PORT: 3000,
        DINGTALK_API_BASE: 'https://oapi.dingtalk.com',
        DINGTALK_APPKEY: 'dingv7zex2izyekxgzpd', // 从钉钉开放平台获取
        DINGTALK_APPSECRET: '4aPY1gB5z3LJnbL4SbOT2vUR9UjS1gWEl9Cce8XJQ3Gi2BdXD9dnwvmJXlLZMs2o',
        ENCRYPTION_KEY: 'zJooRpXgVuO1brG8u9Ie0feaFhaUiskVWHL5735AYpt',
        TOKEN: 'xiIalLnUealxBcEjDw8hyACIRCGDjpbuxp7RmCYTQS',
        CORP_ID: 'ding70b59d18dd575b13f5bf40eda33b7ba0'
    },
    // JWT配置
    jwtSecretKey: 'ahikdhklasnogsdkljfljfeiojhsdkfjjjasioldjopwh',
    // 位置验证配置
    location: {
        COMPANY_LATITUDE: 30.267023, // 示例值，您可以根据实际情况进行修改
        COMPANY_LONGITUDE: 120.107822, // 示例值，您可以根据实际情况进行修改
        ALLOWED_DISTANCE: 1000000 // 允许的距离，例如500米
    },
    //签到时间
    signInTimes: {
        morning: { start: 8, end: 12, late: 10 },
        afternoon: { start: 12, end: 17, late: 15 }
    },
    signOutTimes: {
        morning: { start: 12, end: 13 },
        afternoon: { start: 18, end: 24 }
    },
    
};
