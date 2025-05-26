const Promise = require('bluebird');
const { resolve } = require('path');
const libphonenumber = require('libphonenumber-js');

const DB = require('../libs/db');

require('dotenv-safe').config({ allowEmptyValues: true, path: resolve(__dirname, '../.env') });

const Account = require('../models/account');
const logger = require('../helpers/get-logger')(__filename);

const db = new DB({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  name: process.env.DB_NAME
});

const CODES = ['+355', '+359', '+387', '+389', '+373', '+381', '+386', '+385', '+382'];
async function init() {
  const accounts = await Account.find({ registered_at: { $exists: true, $ne: null } });
  const email = new Set();
  const email2 = new Set();
  await Promise.map(accounts, async acc => {
    if (acc.phone) {
      try {
        const phone = libphonenumber.parseNumber(acc.phone);
        if (CODES.includes(libphonenumber.getCountryCallingCode(phone.country))) {
          email.add(acc.email);
        } else {
          email2.add(acc.email);
        }
      } catch (e) {
        console.log(e);
      }
    }
  });

  console.log(`${email.size} || ${email2.size}`);
  logger.info(Array.from(email));
  console.log('-------------------------');
  // logger.info(Array.from(email2));
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
