const uuid = require('uuid/v4');

/**
 * Generates a unique request ID for all requests, setting it as `ctx.uuid`,
 * `ctx.request.uuid` * and `ctx.state.requestId`. It will also set the
 * `X-Request-Id` header to aid clients with debugging.
 *
 * If there is an `X-Request-Id` header from client, this will be set as
 * `ctx.state.clientRequestId` and as the header `X-Client-Request-Id`.
 *
 * @example
 *   ctx.headers
 *   // { `x-request-id`: '72243aca-e4bb-4a3a-a2e7-ed380c256826' }
 *
 *   ctx.state
 *   // { requestId: '72243aca-e4bb-4a3a-a2e7-ed380c256826' }
 *
 * @return {Function}
 */
function requestId() {
  return (ctx, next) => {
    const reqId = uuid();
    const clientId = ctx.get('X-Request-Id');

    if (clientId) {
      ctx.state.clientRequestId = clientId;
      ctx.set('X-Client-Request-Id', ctx.state.clientRequestId);
    }

    ctx.uuid = reqId;
    ctx.request.uuid = reqId;
    ctx.state.requestId = reqId;

    ctx.set('X-Request-Id', reqId);
    return next();
  };
}

/**
 * Expose `requestId()`.
 */
module.exports = requestId;
