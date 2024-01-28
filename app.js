const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandle = require('./controller/errorController');

const menuRouter = require('./routes/menuRoutes');

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Add request time
app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/menu', menuRouter);

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Build Error Handling Middleware
app.use(globalErrorHandle);

module.exports = app;
