const Promise = require('bluebird');
const path = require('path');
const twilio = require('twilio');

const DB = require('../libs/db');

require('dotenv-safe').config({ allowEmptyValues: true, path: path.resolve(__dirname, '../.env') });

const logger = require('../helpers/get-logger')(__filename);

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const db = new DB({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  name: process.env.DB_NAME
});

// eslint-disable-next-line
function getSmsOutbound() {
  return new Promise((resolve, reject) => {
    try {
      const filterOpts = {
        category: 'sms-outbound',
        startDate: '2018-08-01',
        endDate: '2018-08-30'
      };

      twilioClient.usage.records.daily.each(filterOpts, record => {
        // console.log(record);
        console.log(`${record.startDate} - ${record.endDate}: ${record.count} sms - ${record.price}$`);
        resolve(true);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function getAuthySmsOutbound() {
  return new Promise((resolve, reject) => {
    try {
      const filterOpts = {
        category: 'authy-sms-outbound',
        startDate: '2018-08-01',
        endDate: '2018-08-30'
      };

      twilioClient.usage.records.daily.each(filterOpts, record => {
        // console.log(record);
        console.log(`${record.startDate} - ${record.endDate}: ${record.count} sms - ${record.price}$`);
        resolve(true);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function getAuthyVerifications() {
  return new Promise((resolve, reject) => {
    try {
      const filterOpts = {
        category: 'authy-phone-verifications',
        startDate: '2018-08-01',
        endDate: '2018-08-30'
      };

      twilioClient.usage.records.daily.each(filterOpts, record => {
        // console.log(record);
        console.log(`${record.startDate} - ${record.endDate}: ${record.count} sms - ${record.price}$`);
        resolve(true);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function init() {
  // await getSmsOutbound();
  await getAuthySmsOutbound();
  await getAuthyVerifications();
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
