const Router = require('koa-router');
const _ = require('lodash');
const emailTitles = require('../helpers/mails/email-titles');

const router = new Router();

async function post(ctx) {
  const { body } = ctx.request;
  const title = _.get(body, [0, 'subject']);
  if (Object.values(emailTitles).includes(title)) {
    ctx.logger.info(`
      Error about undelivered:
      smtp server response code: ${_.get(body, [0, 'smtp_server_response_code'])},
      server response: ${_.get(body, [0, 'smtp_server_response'])},
      recipient: ${_.get(body, [0, 'recipient'])},
      subject: ${title},
    `);
  }

  ctx.body = {};
}

router.post('/', post);

module.exports = router;
