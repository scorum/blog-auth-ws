const fetch = require('node-fetch');
const { format } = require('util');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function validateCaptcha(ctx, next) {
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' || !!process.env.DISABLE_CAPTCHA) {
    await next();
    return;
  }

  const captcha = ctx.checkBody('captcha').notEmpty().value;

  ctx.assert(!ctx.errors, 400);

  const body = `secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`;
  const request = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.from(body).length
    },
    body
  });

  const res = await request.json();

  ctx.assert(res.success, 404, ERROR_MESSAGES.REQUEST_INVALID_CAPTCHA, {
    code: ERROR_CODES.REQUEST_INVALID_CAPTCHA
  });

  ctx.logger.info(format('Captcha response: %j', res));

  await next();
}

module.exports = validateCaptcha;
