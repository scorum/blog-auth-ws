const mongoose = require('mongoose');
const { format } = require('util');

mongoose.Promise = require('bluebird');

const logger = require('../helpers/get-logger')();

const MAX_RECONECTIONS = 5;

module.exports = class DB {
  constructor(config) {
    this.config = config;
    this.reconections = 0;

    this._db = mongoose.connection;

    this._db.on('connecting', () => logger.info('connecting to MongoDB...'));
    this._db.on('reconnected', () => logger.info('MongoDB reconnected!'));

    this._db.on('connected', () => {
      logger.info('MongoDB connected!');

      this.reconections = 0;
    });

    this._db.on('error', error => {
      logger.error(format('Error in MongoDb connection: %j'), error);

      this.reconections += 1;

      if (this.reconections === MAX_RECONECTIONS) {
        // TODO: remove process.exit(1)
        // eslint-disable-next-line
        process.exit(1);
      } else {
        mongoose.disconnect();
      }
    });

    this._db.on('disconnected', () => {
      logger.info('MongoDB disconnected!');

      this._connect();
    });

    this._connect();

    return this._db;
  }

  _connect() {
    mongoose.connect(
      `mongodb://${this.config.host}:${this.config.port}/${this.config.name}`,
      { useMongoClient: true }
    );
  }
};
