const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkRegTokenExist(ctx, next) {
  ctx.assert(ctx.state.account.reg_token, 400, ERROR_MESSAGES.REQUEST_ACCOUNT_NOT_HAVE_REG_TOKEN, {
    code: ERROR_CODES.REQUEST_ACCOUNT_NOT_HAVE_REG_TOKEN
  });

  await next();
}

module.exports = checkRegTokenExist;
