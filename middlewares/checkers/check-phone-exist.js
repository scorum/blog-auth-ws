const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkPhoneExist(ctx, next) {
  ctx.assert(ctx.state.account.phone, 400, ERROR_MESSAGES.REQUEST_ACCOUNT_NOT_HAVE_PHONE, {
    code: ERROR_CODES.REQUEST_ACCOUNT_NOT_HAVE_PHONE
  });

  await next();
}

module.exports = checkPhoneExist;
