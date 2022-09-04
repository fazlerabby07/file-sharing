const supertest = require('supertest');
const app = require('../../../app');
const request = supertest(app);
const Files = require('../../../models/files');
const mongoose = require('mongoose');
const testFiles = require('./files.test.data');
const fs = require('fs');
// const path = require('path');

describe('File API endpoints', () => {
	beforeAll(async () => {
		const dbUrl = process.env.MONGODB_URI_TEST;
		await mongoose.connect(dbUrl, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		for (const testFile of testFiles) {
			const newFile = new Files(testFile);
			await newFile.save();
		}
		jest.mock('fs');
	});

	afterAll(async () => {
		await Files.deleteMany();
		await mongoose.connection.close();
	});

	it('POST - Should Upload file and get public and private key', async () => {
		const newFileRes = await request.post('/files').attach('file', `${__dirname}/example.jpg`);

		expect(newFileRes.status).toBe(201);
		expect(newFileRes.body.data).toHaveProperty('privateKey');
		expect(newFileRes.body.data).toHaveProperty('publicKey');
		expect(newFileRes.body.message).toBe('file created successfully');
	});

	it('POST - Should response error for Need to provide file', async () => {
		const newFileRes = await request.post('/files');

		expect(newFileRes.status).toBe(400);
		expect(newFileRes.body.message).toBe('Need to provide file');
		expect(newFileRes.body.error).toBeTruthy();
	});

	it('POST - Should response error for exceeded the upload limit', async () => {
		const newFileRes = await request.post('/files').attach('file', `${__dirname}/example.jpg`);

		expect(newFileRes.status).toBe(400);
		expect(newFileRes.body.message).toBe('you already exceeded the upload limit for today');
		expect(newFileRes.body.error).toBeTruthy();
	});

	it('DELETE - Should Delete File information', async () => {
		jest.spyOn(fs, 'unlinkSync').mockResolvedValue(true);
		const deleteFileRes = await request.delete(`/files/${testFiles[0].privateKey}`);
		expect(deleteFileRes.status).toBe(200);
		expect(deleteFileRes.body.data.message).toBe('file delete successfully.');
	});

	it('DELETE - Should response error file not found', async () => {
		jest.spyOn(fs, 'unlinkSync').mockResolvedValue(true);
		const deleteFileRes = await request.delete(`/files/not-found`);
		expect(deleteFileRes.status).toBe(404);
		expect(deleteFileRes.body.message).toBe('No file found using this private key');
		expect(deleteFileRes.body.error).toBeTruthy();
	});
});
