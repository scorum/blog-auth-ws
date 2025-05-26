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

const ME_COUNTRIES = ['BY', 'RU', 'UA', 'KZ', 'KG', 'TJ', 'GE', 'TM', 'UZ', 'AM'];
const ES_COUNTRIES = [
  'ES',
  'AR',
  'BO',
  'VE',
  'GT',
  'HN',
  'DO',
  'CO',
  'CR',
  'CU',
  'MX',
  'NI',
  'PA',
  'PY',
  'PE',
  'PR',
  'SV',
  'UY',
  'CL',
  'EC'
];
const KR_COUNTRIES = ['KP', 'KR'];
const NET_COUNTRIES = ['CN', 'TW'];
const TC_COUNTRIES = ['TR'];
const IN_COUNTRIES = ['IN'];

async function init() {
  const accounts = await Account.find({ registered_at: { $exists: true, $ne: null } });
  const accum = { com: 0, me: 0, es: 0, kr: 0, net: 0, tc: 0, in: 0 };
  await Promise.map(accounts, async acc => {
    if (acc.phone && !acc.domain) {
      const parsePhone = libphonenumber.parseNumber(acc.phone);

      if (ME_COUNTRIES.includes(parsePhone.country)) {
        await acc.update({ domain: 'me' });
        accum.me += 1;
      } else if (ES_COUNTRIES.includes(parsePhone.country)) {
        await acc.update({ domain: 'es' });
        accum.es += 1;
      } else if (KR_COUNTRIES.includes(parsePhone.country)) {
        await acc.update({ domain: 'kr' });
        accum.kr += 1;
      } else if (NET_COUNTRIES.includes(parsePhone.country)) {
        await acc.update({ domain: 'net' });
        accum.net += 1;
      } else if (TC_COUNTRIES.includes(parsePhone.country)) {
        await acc.update({ domain: 'tc' });
        accum.tc += 1;
      } else if (IN_COUNTRIES.includes(parsePhone.country)) {
        await acc.update({ domain: 'in' });
        accum.in += 1;
      } else {
        await acc.update({ domain: 'com' });
        accum.com += 1;
      }
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
