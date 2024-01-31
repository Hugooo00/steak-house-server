const AppError = require('../utils/appError');

// Error for developer
const errorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// Error for production(for user)
const errorForProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('Error ❌', err);
    res.status(500).json({
      status: 'error',
      message:
        'Our server encountered an internal error. Please try again later.',
    });
  }
};

// Handle duplicate field (e.g. diplicate name)
const handleDuplicateKeyError = (err) => {
  if (err.keyValue.name) {
    const messasge = `Duplicate name: ${err.keyValue.name}. Please use another name`;
    return new AppError(messasge, 400);
  }
  if (err.keyValue.email) {
    const messasge = `Duplicate email: ${err.keyValue.email}. Please use another email`;
    return new AppError(messasge, 400);
  }
  if (err.keyValue.menuItem) {
    const messasge =
      'Review already submitted for this food (Only one review allowed per food item !)';
    return new AppError(messasge, 400);
  }
  // const value = err.keyValue.name || err.keyValue.menuItem;
  // const messasge = `Duplicate field value: ${value}. Please use another value`;
  // return new AppError(messasge, 400);
};

// Handle cast error (e.g. invalid database ID)
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}. Please use another value`;
  return new AppError(message, 400);
};

// Handle validatior error
const handleValidatorError = (err) => {
  const errMessage = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errMessage.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JsonWebTokenError
const handleJsonWebTokenError = () =>
  new AppError('Invalid token. Please login again!', 401);

// Handle TokenExpiredError
const handleTokenExpiredError = () =>
  new AppError('Your token has expired! Please login again', 401);

// Global Error Handling Middleware
module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.code === 11000) {
      err = handleDuplicateKeyError(err);
    }
    if (err.name === 'CastError') {
      err = handleCastError(err);
    }
    if (err.name === 'ValidationError') {
      err = handleValidatorError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      err = handleJsonWebTokenError();
    }
    if (err.name === 'TokenExpiredError') {
      err = handleTokenExpiredError();
    }
    errorForProd(err, res);
  }
};
