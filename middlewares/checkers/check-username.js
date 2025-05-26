const scorum = require('@scorum/scorum-js');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkUsername(ctx, next) {
  const username = ctx.checkBody('username').toLowercase().value;
  // ctx.assert(!ctx.errors, 400);

  ctx.assert(!scorum.utils.validateAccountName(username), 400, ERROR_MESSAGES.REQUEST_INVALID_USERNAME, {
    code: ERROR_CODES.REQUEST_INVALID_USERNAME,
    payload: { username }
  });

  const account = await scorum.api.getAccountsAsync([username]);

  ctx.assert(!account.length, 409, ERROR_MESSAGES.REQUEST_ACCOUNT_ALREADY_EXIST, {
    code: ERROR_CODES.REQUEST_ACCOUNT_ALREADY_EXIST
  });

  ctx.state.username = username;

  await next();
}

module.exports = checkUsername;
