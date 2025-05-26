/*
  eslint-disable
    node/no-unpublished-require
*/

const chai = require('chai');

const getRandomString = require('../../helpers/get-random-string');

const { expect } = chai;

const DEFAULT_LENGTH = 5;

describe('get random string', () => {
  it('should return string with 5 symbols (getRandomString(5))', () => {
    const randomString = getRandomString(5);

    expect(randomString)
      .to.be.a('string')
      .to.have.lengthOf(5);
  });

  it('should return string with 10 symbols (getRandomString(10))', () => {
    const randomString = getRandomString(10);

    expect(randomString)
      .to.be.a('string')
      .to.have.lengthOf(10);
  });

  it('should return string with 0 symbols (getRandomString(0))', () => {
    const randomString = getRandomString(0);

    expect(randomString)
      .to.be.a('string')
      .to.have.lengthOf(0);
  });

  it('should return string with 5 symbols (getRandomString("-5"))', () => {
    const randomString = getRandomString(-7);

    expect(randomString)
      .to.be.a('string')
      .to.have.lengthOf(7);
  });

  it('should return string with 5 symbols (getRandomString("string"))', () => {
    const randomString = getRandomString('string');

    expect(randomString)
      .to.be.a('string')
      .to.have.lengthOf(DEFAULT_LENGTH);
  });

  it('should return string with 5 symbols (getRandomString(true))', () => {
    const randomString = getRandomString(true);

    expect(randomString)
      .to.be.a('string')
      .to.have.lengthOf(DEFAULT_LENGTH);
  });
});
