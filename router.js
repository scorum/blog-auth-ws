const Router = require('koa-router');

const health = require('./controllers/health');
const version = require('./controllers/version');
const account = require('./controllers/account/index');
const accountEmail = require('./controllers/account/email');
// const accountPhone = require('./controllers/account/phone');
const resendEmail = require('./controllers/resend-email');

const validatePrivateUUID = require('./middlewares/validators/validate-private-uuid');

const router = new Router();

router
  .use('/:privateUUID/health', validatePrivateUUID(), health.routes(), health.allowedMethods())
  .use('/:privateUUID/version', validatePrivateUUID(), version.routes(), version.allowedMethods())
  .use('/account', account.routes(), account.allowedMethods())
  .use('/account/email', accountEmail.routes(), accountEmail.allowedMethods())
  // .use('/account/phone', accountPhone.routes(), accountPhone.allowedMethods())
  .use('/resend-email', resendEmail.routes(), resendEmail.allowedMethods());

module.exports = router;
