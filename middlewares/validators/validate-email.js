async function validateEmail(ctx, next) {
  const email = ctx
    .checkBody('email')
    .isEmail()
    .len(0, 255)
    .toLowercase().value;

  ctx.assert(!ctx.errors, 400);

  ctx.state.email = email;

  await next();
}

module.exports = validateEmail;
