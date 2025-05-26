const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkPhoneAlreadyVerified(ctx, next) {
  ctx.assert(!ctx.state.account.phone_verified, 409, ERROR_MESSAGES.REQUEST_PHONE_ALREADY_VERIFIED, {
    code: ERROR_CODES.REQUEST_PHONE_ALREADY_VERIFIED,
    payload: {}
  });

  await next();
}

module.exports = checkPhoneAlreadyVerified;
