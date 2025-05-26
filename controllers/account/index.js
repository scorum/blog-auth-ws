const Router = require('koa-router');
const scorum = require('@scorum/scorum-js');
const _ = require('lodash');

const router = new Router();

const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');
const checkRegToken = require('../../middlewares/checkers/check-reg-token');

async function register(ctx) {
  const { regToken, account } = ctx.state;

  const username = ctx
    .checkBody('username')
    .notEmpty()
    .len(0, 100).value;

  const pubKey = ctx
    .checkBody('pub_key')
    .notEmpty()
    .len(0, 100).value;

  ctx.assert(!ctx.errors, 400);

  const owner = { weight_threshold: 1, account_auths: [], key_auths: [[pubKey, 1]] };
  try {
    await scorum.broadcast.accountCreateByCommitteeAsync(
      process.env.SCR_CREATOR,
      process.env.SCR_CREATOR_NAME,
      username,
      owner,
      owner,
      owner,
      pubKey,
      ''
    );
  } catch (e) {
    const message = _.get(e, ['cause', 'data', 'message']);
    if (message === 'could not insert object, most likely a uniqueness constraint was violated') {
      ctx.throw(404, ERROR_MESSAGES.REQUEST_USERNAME_ALREADY_EXIST, {
        code: ERROR_CODES.REQUEST_USERNAME_ALREADY_EXIST,
        payload: { regToken, username, pubKey, account, message }
      });
    } else {
      ctx.throw(404, ERROR_MESSAGES.REQUEST_ERROR_FROM_BLOCKCHAIN, {
        code: ERROR_CODES.REQUEST_ERROR_FROM_BLOCKCHAIN,
        payload: { regToken, username, pubKey, account, message }
      });
    }
  }

  await account.update({
    username,
    pub_key: pubKey,
    reg_token: '',
    access_token: '',
    registered_at: Date.now()
  });

  try {
    await scorum.broadcast.delegateScorumpowerAsync(
      process.env.SCR_DELEGATOR,
      process.env.SCR_DELEGATOR_NAME,
      username,
      process.env.DELEGATE_SP
    );
  } catch (e) {
    const message = _.get(e, ['cause', 'data', 'message']);
    ctx.throw(404, ERROR_MESSAGES.REQUEST_ERROR_DELEGATION_FROM_BLOCKCHAIN, {
      code: ERROR_CODES.REQUEST_ERROR_DELEGATION_FROM_BLOCKCHAIN,
      payload: { regToken, username, pubKey, account, message }
    });
  }

  ctx.body = {
    click_id: account.click_id || ''
  };
}

async function onValidRegToken(ctx) {
  ctx.body = {};
}

router.post('/check-register-token', checkRegToken, onValidRegToken).post('/register', checkRegToken, register);

module.exports = router;
