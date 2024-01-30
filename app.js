const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss');
const xss = require('xss-clean');

const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandle = require('./controller/errorController');

const menuRouter = require('./routes/menuRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
app.use(express.json());

// 1) Global MiddleWare
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again in an hour!',
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// Allow Dulplicate : {{URL}}api/menu?sort=price&sort=ratingsAverage
app.use(
  hpp({
    whitelist: [
      'price',
      'ratingsQuantity',
      'ratingsAverage',
      'discount',
      'category',
    ],
  }),
);

// 2) test middleware
// Add request time property
app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  next();
});

// 3) Routes
app.use('/api/menu', menuRouter);
app.use('/api/user', userRouter);
app.use('/api/review', reviewRouter);

// 4) Error Handling middleware
// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Build Error Handling Middleware
app.use(globalErrorHandle);

module.exports = app;
