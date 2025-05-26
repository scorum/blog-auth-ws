const dotenv = require('dotenv-safe');
const { resolve } = require('path');

dotenv.config({ allowEmptyValues: true, path: resolve(__dirname, '../.env') });

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
