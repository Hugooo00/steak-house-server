const express = require('express');
const morgan = require('morgan');

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

module.exports = app;
