async function checkDomain(ctx, next) {
  const domain = ctx.checkBody('domain').value;
  ctx.state.domain = domain || 'com';
  await next();
}

module.exports = checkDomain;
