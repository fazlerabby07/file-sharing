const app = require('../../../app');
const request = require('supertest');

describe('health route', () => {
	it('Should return 200', async () => {
		const res = await request(app).get('/health');
		expect(res.status).toEqual(200);
	});
});
