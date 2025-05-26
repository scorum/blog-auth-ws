const Promise = require('bluebird');
const { resolve } = require('path');

const DB = require('../libs/db');

require('dotenv-safe').config({ allowEmptyValues: true, path: resolve(__dirname, '../.env') });

const Account = require('../models/account');
const logger = require('../helpers/get-logger')(__filename);

const db = new DB({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  name: process.env.DB_NAME
});

async function init() {
  const users = [];
  // eslint-disable-next-line
  const accounts = await Account.find({$and: [ {registered_at: { $exists: true, $ne: null }}, {domain: { $exists: true, $ne: null }} ] });

  await Promise.map(accounts, async acc => {
    console.log(`${acc.username}, ${acc.email}, ${acc.domain}`);
  });

  logger.info(users.length);
}

logger.info('Start...');
init()
  .then(() => {
    logger.info('Finish...');

    db.close();

    // eslint-disable-next-line
    process.exit(0);
  })
  .catch(err => {
    logger.error(err);

    // eslint-disable-next-line
    process.exit(1);
  });
