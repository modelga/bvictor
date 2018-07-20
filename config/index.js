const varium = require('varium');

module.exports = varium({ ...process.env }, `${__dirname}/../env.manifest`);
