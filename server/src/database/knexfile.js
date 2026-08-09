// src/database/knexfile.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
console.log('DEBUG DATABASE_URL:', process.env.DATABASE_URL);
module.exports = {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
        directory: path.join(__dirname, 'migrations'),
        extension: 'js',
    },
    seeds: {
        directory: path.join(__dirname, 'seeds'),
    },
};