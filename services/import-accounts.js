const path = require('path');
const Promise = require('bluebird');
const { resolve } = require('path');
const fs = require('fs');

const DB = require('../libs/db');

require('dotenv-safe').config({ allowEmptyValues: true, path: resolve(__dirname, '../.env') });

const Account = require('../models/account');
const logger = require('../helpers/get-logger')();

const db = new DB({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  name: process.env.DB_NAME
});

async function init() {
  const { accounts: newAccounts } = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'accounts.json'), 'utf8'));
  const accounts = await Account.find({ registered_at: { $exists: true, $ne: null } });
  const accEmails = accounts.map(acc => acc.email);
  const accPhones = accounts.map(acc => acc.phone);

  let accum = 0;
  await Promise.map(newAccounts, async acc => {
    if (!accEmails.includes(acc.email) && (acc.phone === '' || !accPhones.includes(acc.phone))) {
      const newAcc = new Account({
        username: acc.username,
        email: acc.email,
        phone: acc.phone,
        pub_key: acc.pub_key,
        registered_at: acc.registered_at,
        phone_verified: acc.phone_verified,
        reg_flow: 'old'
      });

      try {
        await newAcc.save();
      } catch (e) {
        console.error(e);
      }

      accum += 1;
    } else {
      logger.info(`${acc.username} - ${acc.phone}`);
    }
  });

  logger.info(`${accum} from ${newAccounts.length} accounts imported`);
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
