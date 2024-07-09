const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleMulterError = (err) => {
    return new AppError(`${err.message} at ${err.field} because ${err.code}`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 403);

const sendErrorDev = (err, req, res) => {
    // // A) API
    // if (req.originalUrl.startsWith('/api')) {
    //     return res.status(err.statusCode).json({
    //         status: err.status,
    //         error: err,
    //         message: err.message,
    //         stack: err.stack,
    //     });
    // }

    // B) RENDERED WEBSITE
    // console.error('ERROR 💥', err);
    return res.status(err.statusCode).json({
        status: err.status,
        title: 'Something went wrong!',
        msg: err.message,
    });
};

module.exports = (err, req, res, next) => {
    // console.log(err.message);
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.message = err.message || 'Something went wrong !!!';

    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'MulterError') err = handleMulterError(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    sendErrorDev(err, req, res);
};
