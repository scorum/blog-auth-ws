const Account = require('../../models/account');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkEmail(ctx, next) {
  const email = ctx
    .checkBody('email')
    .isEmail()
    .len(0, 255)
    .toLowercase().value;

  ctx.assert(!ctx.errors, 400);

  const isEmail = await Account.findOne({ email, registered_at: { $exists: true, $ne: '' } });

  ctx.assert(!isEmail, 409, ERROR_MESSAGES.REQUEST_EMAIL_ALREADY_EXIST, {
    code: ERROR_CODES.REQUEST_EMAIL_ALREADY_EXIST,
    payload: { email }
  });

  ctx.state.email = email;

  await next();
}

module.exports = checkEmail;
