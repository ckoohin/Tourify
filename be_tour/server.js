require('module-alias/register');
const app = require('./src/app');
const dotenv = require('dotenv');
const env = require('@config/env');

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});