// errorHandler.js

const handleErrors = (err, req, res, next) => {
    // 设置本地错误消息，只在开发环境中提供错误堆栈
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // 渲染错误页面
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: res.locals.error
    });
};

const handleNotFound = (req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
};

module.exports = {
    handleErrors,
    handleNotFound
};
