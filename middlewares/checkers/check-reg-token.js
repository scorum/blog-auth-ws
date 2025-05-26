const Account = require('../../models/account');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkRegToken(ctx, next) {
  const regToken = ctx
    .checkBody('token')
    .notEmpty()
    .len(0, 100).value;

  ctx.assert(!ctx.errors, 400);

  const account = await Account.findOne({ reg_token: regToken });

  ctx.assert(account, 404, ERROR_MESSAGES.REQUEST_INVALID_REG_TOKEN, {
    code: ERROR_CODES.REQUEST_INVALID_REG_TOKEN,
    payload: { regToken }
  });

  ctx.state.regToken = regToken;
  ctx.state.account = account;

  await next();
}

module.exports = checkRegToken;
