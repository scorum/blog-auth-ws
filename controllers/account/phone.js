const Router = require('koa-router');
const uuidv4 = require('uuid/v4');
const auth = require('koa-basic-auth');
const _ = require('lodash');
const { SMS_RESEND_LIMIT_MINS, ERROR_CODES, ERROR_MESSAGES, PHONE_CHANGE_LIMIT_MINS } = require('../../constants');
const sendSms = require('../../helpers/send-sms');

const router = new Router();

const checkPhone = require('../../middlewares/checkers/check-phone');
const validateCaptcha = require('../../middlewares/validators/validate-captcha');
const checkPhoneExist = require('../../middlewares/checkers/check-phone-exist');
const checkAccessToken = require('../../middlewares/checkers/check-access-token');
const checkLocale = require('../../middlewares/checkers/check-locale');
const checkDomain = require('../../middlewares/checkers/check-domain');
const checkSmsCode = require('../../middlewares/checkers/check-sms-code');
const validateBasicAuth = require('../../middlewares/basic-auth');
const checkPhoneAlreadyRegistered = require('../../middlewares/checkers/check-phone-already-registered');
const smsVerify = require('../../helpers/sms-verify');
const mail = require('../../helpers/send-mail');
const Account = require('../../models/account');
const emailTitles = require('../../helpers/mails/email-titles');

async function post(ctx) {
  const { account, phone, accessToken } = ctx.state;

  await account.update({ phone });

  try {
    await smsVerify.sendCode(phone);
  } catch (e) {
    ctx.throw(400, ERROR_MESSAGES.REQUEST_ERROR_FROM_SMS_SERVICE, {
      code: ERROR_CODES.REQUEST_ERROR_FROM_SMS_SERVICE,
      payload: { message: e.message }
    });
  }

  ctx.body = { access_token: accessToken };
}

async function put(ctx) {
  const { account, phone, accessToken } = ctx.state;

  const dateNow = Date.now();

  const changeTimeIsActual = dateNow - new Date(account.phone_changed_at).getTime() < 1000 * 60 * PHONE_CHANGE_LIMIT_MINS;
  const changeCounter = !changeTimeIsActual ? 0 : account.change_phone_counter;

  ctx.assert(
    changeCounter < process.env.PHONE_CHANGE_ATTEMPTS || !changeTimeIsActual,
    404,
    ERROR_MESSAGES.REQUEST_CHANGE_PHONE_ATTEMTS_REACHED,
    {
      code: ERROR_CODES.REQUEST_CHANGE_PHONE_ATTEMTS_REACHED
    }
  );

  await account.update({
    change_phone_counter: changeCounter + 1,
    phone_changed_at: dateNow,
    phone,
    resend_counter: 0,
    resend_at: dateNow
  });

  try {
    await smsVerify.sendCode(phone);
  } catch (e) {
    ctx.throw(400, ERROR_MESSAGES.REQUEST_ERROR_FROM_SMS_SERVICE, {
      code: ERROR_CODES.REQUEST_ERROR_FROM_SMS_SERVICE,
      payload: { message: e.message }
    });
  }

  const attemptsCount = +process.env.SMS_RESEND_ATTEMPTS;

  ctx.body = { access_token: accessToken, attempts: { all: attemptsCount, left: attemptsCount } };
}

async function resendSms(ctx) {
  const { account } = ctx.state;

  const resendTimeIsActual = Date.now() - new Date(account.resend_at).getTime() < 1000 * 60 * SMS_RESEND_LIMIT_MINS;
  const resendCounter = !resendTimeIsActual ? 0 : account.resend_counter;

  ctx.assert(resendCounter < process.env.SMS_RESEND_ATTEMPTS || !resendTimeIsActual, 404, ERROR_MESSAGES.REQUEST_SMS_ATTEMTS_REACHED, {
    code: ERROR_CODES.REQUEST_SMS_ATTEMTS_REACHED
  });

  try {
    await smsVerify.sendCode(account.phone);
  } catch (e) {
    ctx.throw(400, ERROR_MESSAGES.REQUEST_ERROR_FROM_SMS_SERVICE, {
      code: ERROR_CODES.REQUEST_ERROR_FROM_SMS_SERVICE,
      payload: { message: e.message }
    });
  }

  await account.update({ resend_counter: resendCounter + 1, resend_at: Date.now() });

  ctx.body = {
    attempts: {
      all: +process.env.SMS_RESEND_ATTEMPTS,
      left: +process.env.SMS_RESEND_ATTEMPTS - (resendCounter + 1)
    }
  };
}

async function verify(ctx) {
  const { account, locale, domain, project } = ctx.state;
  const { email, accessToken } = account;

  ctx.assert(!ctx.errors, 400);

  const regToken = uuidv4();
  await account.update({ reg_token: regToken, phone_verified: true, domain });

  let link = `${process.env.REG_CONFIRMATION_URL}/${regToken}`;
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
    await mail.sendHTMLMail(email, emailTitles[locale], domain, project, `registration-confirm_${locale}`, {
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

async function resendSmsManually(ctx) {
  const phone = ctx.checkQuery('phone').notBlank().value;
  const code = ctx.checkQuery('code').notBlank().value;

  ctx.assert(!ctx.errors, 400);

  const account = await Account.findOne({ phone: `+${phone}` });

  ctx.assert(account, 404, 'Check account phone number.', { payload: { phone, code } });

  try {
    await sendSms(account.phone, `Your SCORUM verification code is: ${code}`);
  } catch (e) {
    ctx.throw(400, ERROR_MESSAGES.REQUEST_ERROR_FROM_SMS_SERVICE, {
      code: ERROR_CODES.REQUEST_ERROR_FROM_SMS_SERVICE,
      payload: { message: e.message }
    });
  }

  await Account.update({ phone: `+${phone}` }, { $set: { verify_code: code } }, { multi: true });

  ctx.body = {
    success: true,
    payload: {
      phone,
      code
    }
  };
}

router
  .post('/', validateCaptcha, checkAccessToken, checkPhone, post)
  .put('/', validateCaptcha, checkAccessToken, checkPhoneExist, checkPhone, put)
  .get('/resend-sms', validateBasicAuth, auth({ name: process.env.BASIC_AUTH_NAME, pass: process.env.BASIC_AUTH_PASS }), resendSmsManually)
  .post('/resend', checkAccessToken, checkPhoneExist, checkPhoneAlreadyRegistered, resendSms)
  .post(
    '/verify',
    validateCaptcha,
    checkAccessToken,
    checkPhoneExist,
    checkPhoneAlreadyRegistered,
    checkSmsCode,
    checkLocale,
    checkDomain,
    verify
  );

module.exports = router;
