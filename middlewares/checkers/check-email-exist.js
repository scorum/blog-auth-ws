const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkEmailExist(ctx, next) {
  ctx.assert(ctx.state.account.email, 400, ERROR_MESSAGES.REQUEST_ACCOUNT_NOT_HAVE_EMAIL, {
    code: ERROR_CODES.REQUEST_ACCOUNT_NOT_HAVE_EMAIL
  });

  await next();
}

module.exports = checkEmailExist;
