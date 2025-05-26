const loggerHelper = require('../helpers/get-logger');

const logger = () => async (ctx, next) => {
  ctx.logger = loggerHelper(ctx.request.uuid);
  await next();
};

module.exports = logger;
