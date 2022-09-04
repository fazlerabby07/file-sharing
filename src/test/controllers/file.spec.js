const fileController = require('../../controllers/filesController');
const fileService = require('../../services/files');
const fs = require('fs');
const { Providers } = require('../../utils/providersEnum');
const path = require('path');

describe('File Service', () => {
	const mockRequest = {
		file: { filename: 'test_file_name' },
		ip: '::ffff:127.0.0.1',
		params: {
			publicKey: 'publicKey1234',
			privateKey: 'privateKey1234',
		},
	};
	let mockResponse, mockJson, mockStatus, mockNext;
	beforeEach(() => {
		mockJson = jest.fn().mockImplementation(() => null);
		mockSendFile = jest.fn().mockImplementation(() => null);
		mockStatus = jest.fn().mockImplementation(() => ({ json: mockJson, sendFile: mockSendFile }));
		mockResponse = {
			status: mockStatus,
		};
		mockNext = jest.fn();
		jest.mock('fs');
	});

	it('createFileInfo - Should return error with status code 400 and Message is Need to provide file', async () => {
		await fileController.createFileInfo({}, mockResponse, mockNext);
		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockJson).toHaveBeenCalledWith({
			data: null,
			error: true,
			message: 'Need to provide file',
			token: null,
		});
	});

	it('createFileInfo - Should throw error with status code 400 and Message exceeded the upload limit', async () => {
		await jest.spyOn(fileService, 'findTotalUploadByIpAddress').mockResolvedValue(3);
		jest.spyOn(fs, 'unlinkSync').mockResolvedValue(true);
		await jest.spyOn(fileService, 'createFile').mockResolvedValue({
			publicKey: 'd02fe05f-5bdf-4903-b808-46c3dcf62808',
			privateKey: 'e2dd5897-9f4c-491d-8d53-46a55b646f18',
		});
		await fileController.createFileInfo(mockRequest, mockResponse, mockNext);
		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockJson).toHaveBeenCalledWith({
			error: true,
			data: null,
			message: 'you already exceeded the upload limit for today',
			token: null,
		});
	});

	it('createFileInfo - Should should create file with public and private key', async () => {
		await jest.spyOn(fileService, 'findTotalUploadByIpAddress').mockResolvedValue(0);
		await jest.spyOn(fileService, 'createFile').mockResolvedValue({
			publicKey: 'd02fe05f-5bdf-4903-b808-46c3dcf62808',
			privateKey: 'e2dd5897-9f4c-491d-8d53-46a55b646f18',
		});
		await fileController.createFileInfo(mockRequest, mockResponse, mockNext);
		expect(mockStatus).toHaveBeenCalledWith(201);
		expect(mockJson).toHaveBeenCalledWith({
			error: false,
			data: {
				publicKey: 'd02fe05f-5bdf-4903-b808-46c3dcf62808',
				privateKey: 'e2dd5897-9f4c-491d-8d53-46a55b646f18',
			},
			message: 'file created successfully',
			token: null,
		});
	});

	it('getFileByPublicKey - Should throw error with status code 400 and Message exceeded the download limit', async () => {
		await jest.spyOn(fileService, 'findTotalDownloadByIpAddress').mockResolvedValue(3);
		await fileController.getFileByPublicKey(mockRequest, mockResponse, mockNext);
		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockJson).toHaveBeenCalledWith({
			error: true,
			data: null,
			message: 'you already exceeded the download limit for today',
			token: null,
		});
	});

	it('getFileByPublicKey - Should throw error with status code 404 and Message file not found by public key', async () => {
		await jest.spyOn(fileService, 'findTotalDownloadByIpAddress').mockResolvedValue(0);
		await jest.spyOn(fileService, 'getFileByKey').mockResolvedValue(null);
		await fileController.getFileByPublicKey(mockRequest, mockResponse, mockNext);
		expect(mockStatus).toHaveBeenCalledWith(404);
		expect(mockJson).toHaveBeenCalledWith({
			error: true,
			data: {},
			message: 'No file found using this public key',
			token: null,
		});
	});

	it('getFileByPublicKey - Should return provider not local', async () => {
		process.env.PROVIDER = Providers.GOOGLE;
		const mockedFileObj = {
			fileName: '1662243664985-Group 10134.png',
			filePath: '/uploads/1662243664985-Group 10134.png',
			publicKey: 'd02fe05f-5bdf-4903-b808-46c3dcf62808',
			privateKey: 'e2dd5897-9f4c-491d-8d53-46a55b646f18',
			ownerIp: '127.0.0.1',
			downloadInfo: [],
			createdAt: '2022-09-03T22:21:05.290+00:00',
			updatedAt: '2022-09-03T22:21:05.290+00:00',
		};
		await jest.spyOn(fileService, 'findTotalDownloadByIpAddress').mockResolvedValue(0);
		await jest.spyOn(fileService, 'getFileByKey').mockResolvedValue(mockedFileObj);
		await jest
			.spyOn(fileService, 'updateFileById')
			.mockResolvedValue({ message: 'file update successfully' });
		await fileController.getFileByPublicKey(mockRequest, mockResponse, mockNext);
		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockJson).toHaveBeenCalledWith({
			error: true,
			data: null,
			message: 'Your env provider is not local',
			token: null,
		});
	});

	it('getFileByPublicKey - Should return a file by public key', async () => {
		process.env.PROVIDER = Providers.LOCAL;
		const mockedFileObj = {
			fileName: '1662243664985-Group 10134.png',
			filePath: '/uploads/1662243664985-Group 10134.png',
			publicKey: 'd02fe05f-5bdf-4903-b808-46c3dcf62808',
			privateKey: 'e2dd5897-9f4c-491d-8d53-46a55b646f18',
			ownerIp: '127.0.0.1',
			downloadInfo: [],
			createdAt: '2022-09-03T22:21:05.290+00:00',
			updatedAt: '2022-09-03T22:21:05.290+00:00',
		};
		await jest.spyOn(fileService, 'findTotalDownloadByIpAddress').mockResolvedValue(0);
		await jest.spyOn(fileService, 'getFileByKey').mockResolvedValue(mockedFileObj);
		await jest
			.spyOn(fileService, 'updateFileById')
			.mockResolvedValue({ message: 'file update successfully' });
		const filePath = path.join(__dirname, `../../${mockedFileObj.filePath}`);
		await fileController.getFileByPublicKey(mockRequest, mockResponse, mockNext);
		expect(mockStatus).toHaveBeenCalledWith(200);
	});

	it('deleteFIlesByPrivateKey - Should throw error with status code 404 and Message file not found by private key', async () => {
		await jest.spyOn(fileService, 'getFileByKey').mockResolvedValue(null);
		await fileController.deleteFIlesByPrivateKey(mockRequest, mockResponse, mockNext);
		expect(mockStatus).toHaveBeenCalledWith(404);
		expect(mockJson).toHaveBeenCalledWith({
			error: true,
			data: {},
			message: 'No file found using this private key',
			token: null,
		});
	});

	it('deleteFIlesByPrivateKey - Should return deleted file message', async () => {
		const mockedFileObj = {
			fileName: '1662243664985-Group 10134.png',
			filePath: '/uploads/1662243664985-Group 10134.png',
			publicKey: 'd02fe05f-5bdf-4903-b808-46c3dcf62808',
			privateKey: 'e2dd5897-9f4c-491d-8d53-46a55b646f18',
			ownerIp: '127.0.0.1',
			downloadInfo: [],
			createdAt: '2022-09-03T22:21:05.290+00:00',
			updatedAt: '2022-09-03T22:21:05.290+00:00',
		};

		await jest.spyOn(fileService, 'getFileByKey').mockResolvedValue(mockedFileObj);
		await jest
			.spyOn(fileService, 'deleteFileByPrivateKey')
			.mockResolvedValue({ message: 'file delete successfully.' });

		jest.spyOn(fs, 'unlinkSync').mockResolvedValue(true);

		await fileController.deleteFIlesByPrivateKey(mockRequest, mockResponse, mockNext);
		expect(mockStatus).toHaveBeenCalledWith(200);
		expect(mockJson).toHaveBeenCalledWith({
			error: false,
			data: { message: 'file delete successfully.' },
			message: null,
			token: null,
		});
	});
});
