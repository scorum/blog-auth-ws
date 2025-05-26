const Account = require('../../models/account');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkAccessToken(ctx, next) {
  const accessToken = ctx
    .checkBody('token')
    .notEmpty()
    .len(0, 100).value;

  ctx.assert(!ctx.errors, 400);

  const account = await Account.findOne({ access_token: accessToken });

  ctx.assert(account, 400, ERROR_MESSAGES.REQUEST_INVALID_ACCESS_TOKEN, {
    code: ERROR_CODES.REQUEST_INVALID_ACCESS_TOKEN,
    payload: { accessToken }
  });

  ctx.state.accessToken = accessToken;
  ctx.state.account = account;

  await next();
}

module.exports = checkAccessToken;
