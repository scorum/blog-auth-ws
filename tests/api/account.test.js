/*
  eslint-disable
    node/no-unsupported-features,
    node/no-unpublished-require,
    no-unused-expressions
*/

const chai = require('chai');
const request = require('supertest');
const faker = require('faker');

const { TEST_SERVER } = require('../config');
const Account = require('../../models/account');

const { expect } = chai;

describe('routes: account', async () => {
  let accessToken = '';
  const username = 'johndoe';
  const email = faker.internet.email();
  const phone = '+375295418679'; // +375291111111

  const existEmail = 'test@scorum.com';
  const existUsername = 'test';
  const existPhone = '+375291234567';

  before(async () => {
    await Account.collection.drop();

    await Account.findOneAndUpdate(
      { email: existEmail, registered_at: { $exists: true, $ne: '' } },
      { email: existEmail, username: existUsername, phone: existPhone, pub_key: '123', registered_at: new Date() },
      { upsert: true }
    );
  });

  beforeEach(async () => {});
  afterEach(async () => {});

  describe('/account/username', async () => {
    describe('POST /account/username', async () => {
      it('should save username and return access token', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/username')
          .send({ username })
          .expect('Content-Type', /json/)
          .expect(200);

        expect(res.body.access_token).to.be.a('string');
        accessToken = res.body.access_token;
      });

      it('should return error: invalid username format', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/username')
          .send({ username: 'in.correct' })
          .expect('Content-Type', /json/)
          .expect(400);

        expect(res.body.code).to.equal('117');
        expect(res.body.message).to.be.a('string');
      });

      it('should return error: username already exists in blockchain', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/username')
          .send({ username: 'andrew' }) // andrew already exist in blockchain
          .expect('Content-Type', /json/)
          .expect(409);

        expect(res.body.code).to.equal('110');
        expect(res.body.message).to.be.a('string');
      });
    });

    describe('PUT /account/username', () => {
      it('should return error: invalid access token', async () => {
        const res = await request(TEST_SERVER)
          .put('/account/username')
          .send({ token: 'notvalidaccesstoken', username: 'newusername' })
          .expect('Content-Type', /json/)
          .expect(400);

        expect(res.body.code).to.equal('104');
        expect(res.body.message).to.be.a('string');
      });

      it('should update username', async () => {
        await request(TEST_SERVER)
          .put('/account/username')
          .send({ token: accessToken, username: 'newusername' })
          .expect('Content-Type', /json/)
          .expect(200);
      });
    });
  });

  describe('/account/email', async () => {
    describe('POST /account/email', async () => {
      it('should save email and return access token', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/email')
          .send({ token: accessToken, email })
          .expect('Content-Type', /json/)
          .expect(200);

        expect(res.body.access_token).to.be.a('string');
      });

      it('should return error Invalid E-mail Format', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/email')
          .send({ token: accessToken, email: 'incorrect' })
          .expect('Content-Type', /json/)
          .expect(400);

        expect(res.body.code).to.equal('101');
        expect(res.body.message.email).to.be.a('string');
      });

      it('should return error e-mail already in use', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/email')
          .send({ token: accessToken, email: existEmail })
          .expect('Content-Type', /json/)
          .expect(409);

        expect(res.body.code).to.equal('105');
        expect(res.body.message).to.be.a('string');
      });
    });
  });

  describe('/account/phone', async () => {
    describe('POST /account/phone', async () => {
      it('should return error Invalid phone number', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/phone')
          .send({ token: accessToken, phone: '+111111111111' })
          .expect('Content-Type', /json/)
          .expect(400);

        expect(res.body.code).to.equal('112');
        expect(res.body.message).to.be.a('string');
      });

      it('should return error Invalid phone number Format', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/phone')
          .send({ token: accessToken, phone: '12345' })
          .expect('Content-Type', /json/)
          .expect(400);

        expect(res.body.code).to.equal('112');
        expect(res.body.message).to.be.a('string');
      });

      it('should return error phone number already in use', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/phone')
          .send({ token: accessToken, phone: existPhone })
          .expect('Content-Type', /json/)
          .expect(409);

        expect(res.body.code).to.equal('103');
        expect(res.body.message).to.be.a('string');
      });

      it('should save phone and return access token', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/phone')
          .send({ token: accessToken, phone })
          .expect('Content-Type', /json/)
          .expect(200);

        expect(res.body.access_token).to.be.a('string');
      });

      it('should return error You already have phone', async () => {
        const res = await request(TEST_SERVER)
          .post('/account/phone')
          .send({ token: accessToken, phone })
          .expect('Content-Type', /json/)
          .expect(409);

        expect(res.body.code).to.equal('118');
        expect(res.body.message).to.be.a('string');
      });
    });
    describe('POST /account/phone/verify', async () => {
      // ...
    });
    describe('POST /account/phone/resend', async () => {
      // ...
    });
  });
});
