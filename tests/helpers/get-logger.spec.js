/* eslint-disable node/no-unpublished-require */

const chai = require('chai');
const faker = require('faker');

const getLogger = require('../../helpers/get-logger');

const { assert } = chai;

describe('get-logger helper', () => {
  let prefix = null;

  beforeEach(() => {
    prefix = faker.random.word();
  });

  it('should return object', () => {
    const logger = getLogger(prefix);

    assert.typeOf(logger, 'object');
  });

  it('.info should be a function', () => {
    const logger = getLogger(prefix);

    assert.typeOf(logger.info, 'function');
  });

  it('.warn should be a function', () => {
    const logger = getLogger(prefix);

    assert.typeOf(logger.warn, 'function');
  });

  it('.error should be a function', () => {
    const logger = getLogger(prefix);

    assert.typeOf(logger.error, 'function');
  });

  it('.debug should be a function', () => {
    const logger = getLogger(prefix);

    assert.typeOf(logger.debug, 'function');
  });
});
