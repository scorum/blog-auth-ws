const Koa = require('koa');
const cors = require('koa2-cors');
const validate = require('koa-validate');
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');
const scorum = require('@scorum/scorum-js');

const router = require('./router');
const DB = require('./libs/db');

const log = require('./helpers/get-logger')();
const logger = require('./middlewares/logger');
const requestId = require('./middlewares/request-id');
const requests = require('./middlewares/requests');
const errors = require('./middlewares/errors');

const app = new Koa();

app.env = process.env.NODE_ENV;

const db = new DB({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  name: process.env.DB_NAME
});

scorum.api.setOptions({ url: process.env.SCR_RPC_URL });
scorum.config.set('chain_id', process.env.SCR_CHAIN_ID);

app.context.db = db;

app.use(requestId());
app.use(logger());
app.use(requests());

validate(app);

app.use(cors({ origin: process.env.ALLOW_ORIGIN }));
app.use(bodyParser());
app.use(helmet());
app.use(errors());

app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', err => log.error(err));

module.exports = app;
