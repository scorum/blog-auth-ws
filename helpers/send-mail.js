const Promise = require('bluebird');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const fs = Promise.promisifyAll(require('fs'));

function prepareUrl(url = '', domain, locale) {
  return process.env.NODE_ENV === 'dev' ? url : url.replace('.com/', `.${domain}/${locale}/`);
}

const transport = {
  host: process.env.SMTP_HOST,
  domain: process.env.SMTP_DOMAIN,
  port: process.env.SMTP_PORT,
  secure: true,
  authMethod: '',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

const transporter = nodemailer.createTransport(transport, { from: process.env.EMAIL_FROM });

function sendMail(to, subject, html, text) {
  return new Promise((resolve, reject) => {
    transporter.sendMail({ to, html, subject, text }, (err, data) => {
      if (err) {
        reject(new Error(err));
        return;
      }

      resolve(data);
    });
  });
}

async function sendHTMLMail(to, subject, domain, locale, file, htmlData = {}) {
  function send(preparedHTML, preparedTXT) {
    return new Promise((resolve, reject) => {
      transporter.sendMail({ to, html: preparedHTML, subject, text: preparedTXT }, (err, data) => {
        if (err) {
          reject(new Error(err));
          return;
        }

        resolve(data);
      });
    });
  }

  // prepare plain/html format
  const htmlstream = await fs.readFileAsync(`${__dirname}/mails/${file}.html`);
  let preparedHTML = htmlData.link != null ? _.replace(htmlstream, /{{link}}/g, prepareUrl(htmlData.link, domain, locale)) : htmlstream;
  preparedHTML = _.replace(preparedHTML, /{{scorum_url}}/g, prepareUrl(process.env.APP_URL, domain, locale));

  // prepare plain/text format
  const txtstream = await fs.readFileAsync(`${__dirname}/mails/${file}.txt`);
  const preparedTXT = htmlData.link != null ? _.replace(txtstream, /{{link}}/g, prepareUrl(htmlData.link, domain, locale)) : txtstream;

  return send(preparedHTML, preparedTXT);
}

module.exports = {
  sendMail,
  sendHTMLMail
};
