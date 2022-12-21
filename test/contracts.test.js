import request from 'supertest';
import app from '../src/app';

describe('Contracts routes', () => {
  describe('GET /contracts/:id', () => {
    it('returns 401 if Profile does not exists', async () => {
      await request(app)
        .get('/contracts/5')
        .set('profile_id', 60)
        .expect(401)
    })

    it('returns 404 if it does not belong to the profile', async () => {
      await request(app)
        .get('/contracts/5')
        .set('profile_id', 6)
        .expect(404)
    })

    it('returns the contract if it belongs to the profile', async () => {
      const response = await request(app)
        .get('/contracts/5')
        .set('profile_id', 8)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toMatchObject({
        id: 5,
        terms: 'bla bla bla',
        status: 'new',
        ContractorId: 8,
        ClientId: 3
      });
    })
  })

  describe('GET /contracts', () => {
    it('returns 401 if Profile does not exists', async () => {
      await request(app)
        .get('/contracts')
        .set('profile_id', 60)
        .expect(401)
    })

    it('returns the non terminated contracts', async () => {
      const response = await request(app)
        .get('/contracts')
        .set('profile_id', 5)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body.length).toEqual(1)
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 10,
            terms: 'bla bla bla',
            status: 'in_progress',
            ClientId: 1,
            ContractorId:5
          })
        ])
      )
    })
  })
})
