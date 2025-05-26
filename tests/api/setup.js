require('../../helpers/env');
const { HTTP_PORT, DB_NAME } = require('../config');

process.env.NODE_ENV = 'test';
process.env.DB_NAME = DB_NAME;

const app = require('../../app');

async function init() {
  global.server = app.listen(HTTP_PORT);
  global.db = app.context.db;

  console.log(`App in ${process.env.NODE_ENV} mode started successfully on the port ${HTTP_PORT}`);
}

init()
  .then(() => console.log('Tests setuped'))
  .catch(err => console.log(err));
