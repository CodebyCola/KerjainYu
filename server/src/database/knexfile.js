// src/database/knexfile.js
const path = require('path');

if (process.env.NODE_ENV === 'test') {
    require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });
} else {
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });
}

console.log('DEBUG DATABASE_URL:', process.env.DATABASE_URL);
console.log('DEBUG NODE ENV : ', process.env.NODE_ENV)

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
