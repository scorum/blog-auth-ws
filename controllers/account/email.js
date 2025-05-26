const Router = require('koa-router');
const uuidv4 = require('uuid/v4');
const _ = require('lodash');

const router = new Router();

const Account = require('../../models/account');
const checkAccessToken = require('../../middlewares/checkers/check-access-token');
const checkEmail = require('../../middlewares/checkers/check-email');
const checkLocale = require('../../middlewares/checkers/check-locale');
const checkDomain = require('../../middlewares/checkers/check-domain');
const checkProject = require('../../middlewares/checkers/check-project');
const checkEmailExist = require('../../middlewares/checkers/check-email-exist');
const checkRegTokenExist = require('../../middlewares/checkers/check-reg-token-exist');
const validateCaptcha = require('../../middlewares/validators/validate-captcha');
const mail = require('../../helpers/send-mail');
const emailTitles = require('../../helpers/mails/email-titles');
const langLocale = require('../../helpers/mails/lang-locale');
const { getRegUrl } = require('../../helpers/mails/reg-url');
const { ERROR_CODES, ERROR_MESSAGES } = require('../../constants');

async function resendRegEmail(ctx) {
  const { account, locale, domain, project } = ctx.state;

  // const regToken = uuidv4();
  // await account.update({ reg_token: regToken });

  try {
    await mail.sendHTMLMail(account.email, emailTitles[locale], domain, langLocale[locale], `registration-confirm_${locale}`, {
      link: `${getRegUrl(project)}/${account.reg_token}`
    });
  } catch (e) {
    ctx.throw(400, ERROR_MESSAGES.REQUEST_ERROR_FROM_EMAIL_SERVICE, {
      code: ERROR_CODES.REQUEST_ERROR_FROM_EMAIL_SERVICE,
      payload: { message: e.message }
    });
  }

  ctx.body = {};
}

async function saveEmail(ctx) {
  const { email, locale, domain, project } = ctx.state;

  const clickId = ctx
    .checkBody('click_id')
    .optional()
    .len(0, 100).value;

  const trafficId = ctx
    .checkBody('traffic_id')
    .optional()
    .len(0, 100).value;

  ctx.assert(!ctx.errors, 400);

  const accessToken = uuidv4();
  const regToken = uuidv4();
  const acccount = new Account({
    email,
    access_token: accessToken,
    reg_token: regToken,
    domain,
    project,
    click_id: clickId,
    traffic_id: trafficId
  });

  try {
    await acccount.save();
  } catch (e) {
    ctx.throw(e);
  }

  let link = `${getRegUrl(project)}/${regToken}`;
  const seaUrlParams = process.env.SEA_URL_SUPPORTED_PARAMS ? process.env.SEA_URL_SUPPORTED_PARAMS.split(' ') : [];
  const urlParams = [];
  const postParams = _.get(ctx, 'request.body');

  Object.keys(postParams).forEach(paramKey => {
    if (seaUrlParams.includes(paramKey)) {
      const paramVal = postParams[paramKey];
      urlParams.push(`${paramKey}=${Array.isArray(paramVal) ? paramVal[0] : paramVal}`);
    }
  });

  if (urlParams.length !== 0) {
    link += `?${urlParams.join('&')}`;
  }

  try {
    await mail.sendHTMLMail(email, emailTitles[locale], domain, langLocale[locale], `registration-confirm_${locale}`, {
      link
    });
  } catch (e) {
    ctx.throw(400, ERROR_MESSAGES.REQUEST_ERROR_FROM_EMAIL_SERVICE, {
      code: ERROR_CODES.REQUEST_ERROR_FROM_EMAIL_SERVICE,
      payload: { message: e.message }
    });
  }

  ctx.body = { access_token: accessToken };
}

async function updateEmail(ctx) {
  const { account, accessToken, email, locale, domain, project } = ctx.state;
  const regToken = uuidv4();

  await account.update({ reg_token: regToken, email });

  try {
    await mail.sendHTMLMail(email, emailTitles[locale], domain, langLocale[locale], `registration-confirm_${locale}`, {
      link: `${getRegUrl(project)}/${regToken}`
    });
  } catch (e) {
    ctx.throw(400, ERROR_MESSAGES.REQUEST_ERROR_FROM_EMAIL_SERVICE, {
      code: ERROR_CODES.REQUEST_ERROR_FROM_EMAIL_SERVICE,
      payload: { message: e.message }
    });
  }

  ctx.body = { access_token: accessToken };
}

router
  .post('/', validateCaptcha, checkEmail, checkLocale, checkDomain, checkProject, saveEmail)
  .put('/', validateCaptcha, checkAccessToken, checkEmailExist, checkEmail, checkLocale, checkDomain, checkProject, updateEmail)
  .post(
    '/resend-registration-email',
    validateCaptcha,
    checkAccessToken,
    checkRegTokenExist,
    checkLocale,
    checkDomain,
    checkProject,
    resendRegEmail
  );

module.exports = router;
