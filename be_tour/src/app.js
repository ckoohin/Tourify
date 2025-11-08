const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100
});
app.use('/api', limiter);

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/tours', require('./routes/tours'));
app.use('/api/v1/bookings', require('./routes/bookings'));
app.use('/api/v1/customers', require('./routes/customers'));
app.use('/api/v1/guides', require('./routes/guides'));
app.use('/api/v1/providers', require('./routes/providers'));
app.use('/api/v1/payments', require('./routes/payments'));
app.use('/api/v1/reports', require('./routes/reports'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

module.exports = app;