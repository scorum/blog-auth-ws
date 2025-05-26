const path = require('path');
const Promise = require('bluebird');
const { resolve } = require('path');
const fs = require('fs');

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
  const presaleUsers = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'presale-users.json'), 'utf8'));

  const accum = { com: 0, me: 0, es: 0, kr: 0, net: 0, tc: 0, in: 0 };
  await Promise.map(presaleUsers, async user => {
    const acc = await Account.findOne({ email: user.email, registered_at: { $exists: true, $ne: null } });
    if (acc && !acc.domain) {
      await acc.update({ domain: user.domain });
      accum[user.domain] += 1;
    }
  });

  logger.info(JSON.stringify(accum));
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
