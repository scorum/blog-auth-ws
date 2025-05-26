const { ERROR_CODES, ERROR_MESSAGES } = require('../constants');
const { format } = require('util');

const errors = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    let { code, message } = err;
    const { status, payload } = err;

    ctx.status = status || 400;

    if (ctx.errors && ctx.errors.length) {
      ctx.logger.debug(format('path=%s, state=%j, errors=%j', ctx.path, ctx.state, ctx.errors));

      code = ERROR_CODES.REQUEST_VALIDATION_ERROR;
      message = ctx.errors.reduce((errs, error) => Object.assign(errs, error), {});
    } else if (status && status < 500) {
      ctx.logger.log({
        level: 'error',
        message,
        path: ctx.path,
        state: ctx.state,
        payload,
        stack: err.stack
      });
    } else {
      ctx.logger.log({
        level: 'error',
        message,
        path: ctx.path,
        state: ctx.state,
        payload,
        stack: err.stack
      });
      // ctx.logger.error('errors - path=%s, state=%j, message=%s, stack=%s', ctx.path, ctx.state, message, err.stack);

      code = ERROR_CODES.SERVER_ERROR;
      message = process.env.NODE_ENV === 'production' ? ERROR_MESSAGES.SERVER_ERROR : message;

      ctx.status = 500;
    }

    ctx.body = { code, message };
  }
};

module.exports = errors;
