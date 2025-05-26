/* istanbul ignore file */

const { red, green, yellow, grey } = require('colors');
const { format, createLogger, transports } = require('winston');
const Sentry = require('winston-sentry-raven-transport');
const util = require('util');

const { label, printf, combine, timestamp } = format;

function getColor(level) {
  switch (level) {
    case 'warn':
      return yellow;
    case 'error':
      return red;
    case 'debug':
      return grey;
    default:
      return green;
  }
}

function myFormat(...args) {
  return printf(info => {
    const color = getColor(info.level);
    const coloredPrefix = color(`[${info.level}] [${info.label}] -`);

    return `${coloredPrefix} ${info.message} ${info.payload ? util.format('%j', info.payload) : ''} ${args.join(',')}`;
  });
}

const sentryFormat = format(info => {
  const output = Object.assign({}, info);
  const message = `${info.message.replace(/^(errors - )/g, '')}`;
  output.message = message;
  output.fingerprint = message;
  return output;
});

function getLogger(reqId = '', ...args) {
  return createLogger({
    level: process.env.NODE_ENV === 'dev' ? 'debug' : null,
    format: combine(timestamp(), label({ label: reqId }), myFormat(...args)),
    transports: [
      new transports.Console({ colorize: true, silent: process.env.NODE_ENV === 'test' }),
      new Sentry({
        level: 'error',
        format: sentryFormat(),
        dsn: process.env.SENTRY_DSN,
        silent: process.env.NODE_ENV === 'test',
        config: {
          environment: process.env.NODE_ENV
        }
      })
    ]
  });
}

module.exports = getLogger;
