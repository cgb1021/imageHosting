const log4js = require('log4js');
log4js.configure(`${process.cwd()}/config/log4js.json`);

exports.getLogger = (category) => log4js.getLogger(category);
