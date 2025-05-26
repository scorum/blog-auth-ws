const smsVerify = require('../../helpers/sms-verify');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function checkSmsCode(ctx, next) {
  const code = ctx
    .checkBody('code')
    .notEmpty()
    .len(2, 10)
    .toUppercase().value;

  ctx.assert(!ctx.errors, 400);

  if (ctx.state.account.verify_code) {
    ctx.assert(code === ctx.state.account.verify_code.toUpperCase(), 404, ERROR_MESSAGES.REQUEST_INVALID_SMS_CODE, {
      code: ERROR_CODES.REQUEST_INVALID_SMS_CODE,
      payload: { code, verify_code: ctx.state.account.verify_code }
    });
  } else {
    let res = {};
    try {
      res = await smsVerify.verificationCheck(ctx.state.account.phone, code);
    } catch (e) {
      ctx.throw(400, ERROR_MESSAGES.REQUEST_ERROR_FROM_SMS_SERVICE, {
        code: ERROR_CODES.REQUEST_ERROR_FROM_SMS_SERVICE,
        payload: { message: e.message }
      });
    }

    ctx.assert(res.success, 404, ERROR_MESSAGES.REQUEST_INVALID_SMS_CODE, {
      code: ERROR_CODES.REQUEST_INVALID_SMS_CODE,
      payload: { code }
    });
  }

  await next();
}

module.exports = checkSmsCode;
