import request from 'supertest';
import app from '../../src/app';

describe('Admin/BestProfession routes', () => {
  describe('POST /admin/best-profession', () => {
    it('returns error if the queries are missing', async () => {
      const response = await request(app)
        .get('/admin/best-profession')
        .expect(422)

      expect(response.body.error).toEqual('Missing dates')
    })

    it('returns error if one query is missing', async () => {
      const response = await request(app)
        .get('/admin/best-profession')
        .query({
          start: '2020-08-15T19:11:26.737Z'
        })
        .expect(422)

      expect(response.body.error).toEqual('Missing dates')
    })

    it('returns the profession that earned the most money from 2020-08-15 to 2020-08-17', async () => {
      const response = await request(app)
        .get('/admin/best-profession')
        .query({
          start: '2020-08-15T19:11:26.737Z',
          end: '2020-08-17T19:11:26.737Z'
        })
        .expect(200)

      expect(response.body).toEqual([
        { profession: 'Musician', earned: 221 },
        { profession: 'Programmer', earned: 200 },
        { profession: 'Fighter', earned: 200 }
      ])
    })

    it('returns the profession that earned the most money from 2020-08-13 to 2020-08-17', async () => {
      const response = await request(app)
        .get('/admin/best-profession')
        .query({
          start: '2020-08-13T19:11:26.737Z',
          end: '2020-08-17T19:11:26.737Z'
        })
        .expect(200)

      expect(response.body).toEqual([
        { profession: 'Programmer', earned: 663 },
        { profession: 'Musician', earned: 221 },
        { profession: 'Fighter', earned: 200 }
      ])
    })
  })
})