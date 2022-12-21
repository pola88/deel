import request from 'supertest';
import app from '../src/app';
import models from '../src/model';


describe('Balances routes', () => {
  describe('POST /balances/deposit/:userId', () => {
    it('deposits money if the money is less than 25% his total of jobs to pay', async () => {
      const response = await request(app)
        .post('/balances/deposit/2')
        .send({ amount: 300 })
        .expect(422)

      expect(response.body.error).toEqual('Amount not allowed')
    })

    it('deposits money if the money is less than 25% his total of jobs to pay', async () => {
      let profile = await models.Profile.findByPk(2)
      const currentBalance = profile.balance;
      const response = await request(app)
        .post('/balances/deposit/2')
        .send({ amount: 10 })
        .expect(201)
      await profile.reload()
      expect(profile.balance).toEqual(currentBalance + 10)
    })
  })
})