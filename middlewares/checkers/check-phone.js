const twilio = require('twilio');

const Account = require('../../models/account');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function checkPhone(ctx, next) {
  const phone = ctx.checkBody('phone').notEmpty().value;

  try {
    await twilioClient.lookups.v1.phoneNumbers(phone).fetch();
  } catch (e) {
    ctx.throw(400, ERROR_MESSAGES.REQUEST_INVALID_PHONE_NUMBER, {
      code: ERROR_CODES.REQUEST_INVALID_PHONE_NUMBER,
      payload: { phone }
    });
  }

  const isPhoneExist = await Account.findOne({ phone, registered_at: { $exists: true, $ne: '' } });

  ctx.assert(!isPhoneExist, 409, ERROR_MESSAGES.REQUEST_PHONE_ALREADY_EXIST, {
    code: ERROR_CODES.REQUEST_PHONE_ALREADY_EXIST,
    payload: { phone }
  });

  ctx.state.phone = phone;

  await next(ctx.state.phone);
}

module.exports = checkPhone;
