const Account = require('../../models/account');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkPhoneAlreadyRegistered(ctx, next) {
  const {
    account: { phone }
  } = ctx.state;
  const isPhoneExist = await Account.findOne({ phone, registered_at: { $exists: true, $ne: '' } });

  ctx.assert(!isPhoneExist, 409, ERROR_MESSAGES.REQUEST_PHONE_ALREADY_EXIST, {
    code: ERROR_CODES.REQUEST_PHONE_ALREADY_EXIST,
    payload: { phone }
  });

  await next();
}

module.exports = checkPhoneAlreadyRegistered;
