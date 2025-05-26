const { resolve } = require('path');
const uuidv4 = require('uuid/v4');
const DB = require('../libs/db');
const getRandomString = require('../helpers/get-random-string');

require('dotenv-safe').config({ allowEmptyValues: true, path: resolve(__dirname, '../.env') });

const Account = require('../models/account');
const logger = require('../helpers/get-logger')(__filename);

const db = new DB({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  name: process.env.DB_NAME
});

const NUM = 1;

async function init() {
  for (let i = 0; i < NUM; i += 1) {
    const accessToken = uuidv4();
    const regToken = uuidv4();
    const acccount = new Account({
      email: `${getRandomString(8)}@scorum.com`,
      access_token: accessToken,
      reg_token: regToken,
      phone_verified: true,
      phone: getRandomString(12),
      domain: 'com'
    });

    try {
      await acccount.save();
      logger.info(`https://scorum.com/registration/${regToken}`);
    } catch (e) {
      logger.error(e);
    }
  }
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
