async function basicAuth(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.set('WWW-Authenticate', 'Basic');
      ctx.body = 'Provide auth credentials.';
    } else {
      throw err;
    }
  }
}

module.exports = basicAuth;
