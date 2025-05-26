const Promise = require('bluebird');
const twilio = require('twilio');
const { format } = require('util');
const logger = require('../helpers/get-logger')();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
Promise.promisifyAll(twilioClient.messages);

async function sendSms(to, body) {
  const smsResponse = await twilioClient.messages.create({ messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID, to, body });

  logger.info(format('Response from sms service: %j', smsResponse));

  return smsResponse;
}

module.exports = sendSms;
