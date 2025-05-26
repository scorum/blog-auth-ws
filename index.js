require('./helpers/env');
const app = require('./app');
const logger = require('./helpers/get-logger')();

const env = process.env.NODE_ENV || 'dev';
const port = process.env.HTTP_PORT || 4000;

async function main() {
  app.listen(process.env.HTTP_PORT);
  logger.info(`App in ${env} mode started successfully on the port ${port}`);
}

main();
