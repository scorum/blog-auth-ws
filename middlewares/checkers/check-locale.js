async function checkLocale(ctx, next) {
  const locale = ctx.checkBody('locale').value;
  ctx.state.locale = locale || 'en';
  await next();
}

module.exports = checkLocale;
