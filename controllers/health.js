const Router = require('koa-router');
const { format } = require('util');

const { HEALTH_STATUSES } = require('../constants');

const Health = require('../models/health');

const router = new Router();

async function get(ctx) {
  const { privateUUID } = ctx.state;

  if (privateUUID !== process.env.HEALTH_UUID) {
    return;
  }

  let status = HEALTH_STATUSES.OK;
  let mongoTime;

  try {
    const timestamp = Date.now();

    let health = await Health.findOne({});

    if (!health) {
      health = new Health({ timestamp });
      await health.save();
    } else {
      await health.update({ timestamp });
    }

    mongoTime = timestamp;
  } catch (error) {
    ctx.logger.error(format('get - error=%j', error));
  }

  if (!mongoTime) {
    status = HEALTH_STATUSES.FAIL;
  }

  ctx.body = {
    status
  };
}

router.get('/', get);

module.exports = router;
