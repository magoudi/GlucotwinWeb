const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const { clientOrigins, nodeEnv } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const apiRoutes = require('./routes');

const app = express();

app.use(logger(nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: clientOrigins,
  credentials: true,
}));
app.use(express.json({
  limit: '1mb',
  // Save raw body for Stripe webhook signature verification
  verify: (req, _res, buf) => {
    if (req.url === '/api/subscriptions/webhook' || req.originalUrl === '/api/subscriptions/webhook') {
      req.rawBody = buf;
    }
  },
}));
app.use(cookieParser());

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
