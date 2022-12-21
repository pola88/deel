import request from 'supertest';
import app from '../../src/app';

describe('Admin/BestClient routes', () => {
  describe('POST /admin/best-client', () => {
    it('returns error if the queries are missing', async () => {
      const response = await request(app)
        .get('/admin/best-client')
        .expect(422)

      expect(response.body.error).toEqual('Missing dates')
    })

    it('returns error if one query is missing', async () => {
      const response = await request(app)
        .get('/admin/best-client')
        .query({
          start: '2020-08-15T19:11:26.737Z'
        })
        .expect(422)

      expect(response.body.error).toEqual('Missing dates')
    })

    it('returns the client that paid the most money from 2020-08-15 to 2020-08-17', async () => {
      const response = await request(app)
        .get('/admin/best-client')
        .query({
          start: '2020-08-15T19:11:26.737Z',
          end: '2020-08-17T19:11:26.737Z'
        })
        .expect(200)

      expect(response.body).toEqual( [
        { id: 1, fullName: 'Harry Potter', paid: 221 },
        { id: 3, fullName: 'John Snow', paid: 200 }
      ])
    })

    it('returns the client that paid the most money from 2020-08-15 to 2020-08-17 limit 1', async () => {
      const response = await request(app)
        .get('/admin/best-client')
        .query({
          start: '2020-08-15T19:11:26.737Z',
          end: '2020-08-17T19:11:26.737Z',
          limit: 1
        })
        .expect(200)

      expect(response.body).toEqual( [
        { id: 1, fullName: 'Harry Potter', paid: 221 }
      ])
    })

    it('returns the client that paid the most money from 2020-08-13 to 2020-08-17', async () => {
      const response = await request(app)
        .get('/admin/best-client')
        .query({
          start: '2020-08-13T19:11:26.737Z',
          end: '2020-08-17T19:11:26.737Z'
        })
        .expect(200)

      expect(response.body).toEqual([
        { id: 1, fullName: 'Harry Potter', paid: 442 },
        { id: 2, fullName: 'Mr Robot', paid: 321 }
      ])
    })
  })
})