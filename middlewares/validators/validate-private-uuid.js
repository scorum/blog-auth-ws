const { format } = require('util');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

const validatePrivateUUID = () => async (ctx, next) => {
  const privateUUID = ctx.checkParams('privateUUID').isUUID().value;

  ctx.logger.debug(format('validatePrivateUUID - privateUUID=%s', privateUUID));

  ctx.assert(!ctx.errors, 400);
  ctx.assert(process.env.HEALTH_UUID === privateUUID, 400, ERROR_MESSAGES.REQUEST_INVALID_PRIVATE_UUID, {
    code: ERROR_CODES.REQUEST_INVALID_PRIVATE_UUID
  });

  ctx.state.privateUUID = privateUUID;

  await next();
};

module.exports = validatePrivateUUID;
