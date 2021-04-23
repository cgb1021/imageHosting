const mysql = require('mysql');
const env = require('../config/env');
const config = require('../config/database')[env.isProduction ? 'production' : 'dev']['mysql'];

const pool = mysql.createPool(config);
console.log('mysql');