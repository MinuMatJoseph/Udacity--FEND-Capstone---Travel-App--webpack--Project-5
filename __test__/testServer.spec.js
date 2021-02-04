// Link to server file
import {app} from '../src/server/server' 

const supertest = require('supertest')
const request = supertest(app)
it('Endpoint Testing ', async done => {
  const response = await request.get('/getTravelData')
  expect(response.status).toBe(200) // check request status
  expect(response.body).toBeDefined(); // check response returned value of travelData
  done()
})