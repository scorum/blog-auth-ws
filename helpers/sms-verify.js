const Promise = require('bluebird');
const authy = require('authy');
const libphonenumber = require('libphonenumber-js');
const { format } = require('util');
const logger = require('../helpers/get-logger')();

const authyClient = authy(process.env.AUTHY_API_KEY);

function verificationStartAsync(phone, countryCode) {
  return new Promise((resolve, reject) => {
    authyClient.phones().verification_start(phone, countryCode, 'sms', (err, res) => {
      if (err) {
        reject(new Error(err));
        return;
      }

      logger.info(format('Response from sms verify service: %j', res));
      resolve(res);
    });
  });
}

function verificationCheckAsync(phone, countryCode, code) {
  return new Promise((resolve, reject) => {
    authyClient.phones().verification_check(phone, countryCode, code, (err, res) => {
      if (err) {
        // Verification code is incorrect
        if (err.error_code === '60022') {
          resolve(err);
        } else {
          reject(new Error(err.message));
        }
        return;
      }

      logger.info(format('Response from sms verify service: %j', res));
      resolve(res);
    });
  });
}

async function sendCode(phone) {
  const parsePhone = libphonenumber.parseNumber(phone);
  const countryCode = libphonenumber.getCountryCallingCode(parsePhone.country);

  if (process.env.NODE_ENV === 'test') return {};

  const res = await verificationStartAsync(parsePhone.phone, countryCode);
  return res;
}

async function verificationCheck(phone, code) {
  const parsePhone = libphonenumber.parseNumber(phone);
  const countryCode = libphonenumber.getCountryCallingCode(parsePhone.country);

  const res = await verificationCheckAsync(phone, countryCode, code);

  return res;
}

module.exports = {
  sendCode,
  verificationCheck
};
