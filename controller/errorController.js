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
const handleDuplicateName = (err) => {
  const messasge = `Duplicate field value: ${err.keyValue.name}. Please use another value`;
  return new AppError(messasge, 400);
};

// Handle cast error (e.g. invalid database ID)
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}. Please use another value`;
  return new AppError(message, 400);
};

// Handle validatior error
const handleValidatorError = (err) => {
  //   const message = `Invalid input data. ${err.message}`;
  const errMessage = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errMessage.join('. ')}`;
  return new AppError(message, 400);
};

// Global Error Handling Middleware
module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.code === 11000) {
      err = handleDuplicateName(err);
    }
    if (err.name === 'CastError') {
      err = handleCastError(err);
    }
    if (err.name === 'ValidationError') {
      err = handleValidatorError(err);
    }
    errorForProd(err, res);
  }
};
