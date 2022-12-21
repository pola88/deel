import request from 'supertest';
import app from '../src/app';
import models from '../src/model';


describe('Jobs routes', () => {
  describe('GET /jobs/unpaid', () => {
    it('returns 401 if Profile does not exists', async () => {
      await request(app)
        .get('/jobs/unpaid')
        .set('profile_id', 60)
        .expect(401)
    })

    it('returns 200 and unpaid jobs for contractor', async () => {
      const response = await request(app)
        .get('/jobs/unpaid')
        .set('profile_id', 7)
        .expect(200)

      expect(response.body.length).toEqual(3)

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            description: 'work',
            price: 200,
            paid: false,
            paymentDate: null,
          }),
          expect.objectContaining({
            description: 'work',
            price: 200,
            paid: false,
            paymentDate: null,
          }),
          expect.objectContaining({
            description: 'work',
            price: 2020,
            paid: false,
            paymentDate: null,
          }),
        ])
      )
    })

    it('returns 200 and unpaid jobs for client', async () => {
      const response = await request(app)
        .get('/jobs/unpaid')
        .set('profile_id', 4)
        .expect(200)

      expect(response.body.length).toEqual(2)
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            description: 'work',
            price: 200,
            paid: false,
            paymentDate: null,
          }),
          expect.objectContaining({
            description: 'work',
            price: 2020,
            paid: false,
            paymentDate: null,
          })
        ])
      )
    })
  })

  describe('POST /jobs/:job_id/pay', () => {
    it('returns 401 if Profile does not exists', async () => {
      await request(app)
        .post('/jobs/1/pay')
        .set('profile_id', 60)
        .expect(401)
    })

    it('returns 201 if the client balance is >= price', async () => {
      await request(app)
        .post('/jobs/11/pay')
        .set('profile_id', 1)
        .expect(201)

      const client = await models.Profile.findByPk(1)
      expect(client.balance).toEqual(950)

      const contractor = await models.Profile.findByPk(5)
      expect(contractor.balance).toEqual(264)

      const job = await models.Job.findByPk(11)
      expect(job.paid).toEqual(true)
      expect(job.paymentDate).not.toBeNull()
    })

    it('returns 422 if the client balance is < price', async () => {
      const response = await request(app)
        .post('/jobs/16/pay')
        .set('profile_id', 4)
        .expect(422)

      const client = await models.Profile.findByPk(4)
      expect(client.balance).toEqual(1.3)

      const contractor = await models.Profile.findByPk(7)
      expect(contractor.balance).toEqual(22)

      expect(response.body).toEqual({ error: 'Insufficient balance'})
    })
  });
})