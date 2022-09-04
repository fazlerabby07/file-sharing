const _log = require('../utils/logger');
const filesService = require('../services/files');
const { createResponse } = require('../utils/responseGenerate');
const crypto = require('crypto');
const path = require('path');
const { Providers } = require('../utils/providersEnum');
const fs = require('fs');

const createFileInfo = async (req, res, next) => {
	try {
		if (req.file) {
			const privateKey = crypto.randomUUID();
			const publicKey = crypto.randomUUID();
			const ownerIp = req.ip.split(':').slice(-1)[0];

			// check if user ip address exist the upload file
			const uploadCount = await filesService.findTotalUploadByIpAddress(ownerIp);

			// if exist the limit then remove the file form local and give an error response
			if (uploadCount >= process.env.DAILY_UPLOAD_LIMIT) {
				const filePath = path.join(__dirname, `../uploads/${req.file.filename}`);
				fs.unlinkSync(filePath);

				return res
					.status(400)
					.json(
						createResponse(null, 'you already exceeded the upload limit for today', true, null),
					);
			}

			const fileInfo = {
				fileName: req.file.filename,
				filePath: `/uploads/${req.file.filename}`,
				privateKey,
				publicKey,
				ownerIp,
			};

			// If all condition passed then create file information in DB
			const newFileCreate = await filesService.createFile(fileInfo);
			return res
				.status(201)
				.json(createResponse(newFileCreate, 'file created successfully', false, null));
		} else {
			return res.status(400).json(createResponse(null, 'Need to provide file', true, null));
		}
	} catch (error) {
		_log(error, 'red');
		return next(new Error(error));
	}
};

const getFileByPublicKey = async (req, res, next) => {
	try {
		// split the ip
		const ip = req.ip.split(':').slice(-1)[0];

		// check if user have limit to download files
		const downloadCount = await filesService.findTotalDownloadByIpAddress(ip);

		// if user exist the limit then send error response
		if (downloadCount >= process.env.DAILY_DOWNLOAD_LIMIT) {
			return res
				.status(400)
				.json(createResponse(null, 'you already exceeded the download limit for today', true, null));
		}

		// get file info using file public key
		const file = await filesService.getFileByKey({ publicKey: req.params.publicKey });

		if (!file)
			return res
				.status(404)
				.json(createResponse({}, 'No file found using this public key', true, null));

		if (process.env.PROVIDER === Providers.LOCAL) {
			filesService.updateFileById(file._id, ip);

			const filePath = path.join(__dirname, `../${file.filePath}`);
			return res.status(200).download(filePath);
			// return res.status(200).json(createResponse(file, 'Your env provider is not local', true, null));
		}

		return res.status(400).json(createResponse(null, 'Your env provider is not local', true, null));
	} catch (error) {
		_log(error, 'red');
		return next(new Error(error));
	}
};

const deleteFIlesByPrivateKey = async (req, res, next) => {
	try {
		// get file Information
		const file = await filesService.getFileByKey({ privateKey: req.params.privateKey });

		if (!file)
			return res
				.status(404)
				.json(createResponse({}, 'No file found using this private key', true, null));

		// delete file from local directory
		const filePath = path.join(__dirname, `../${file.filePath}`);
		fs.unlinkSync(filePath);

		// delete file info using file private key
		const deleteFile = await filesService.deleteFileByPrivateKey(req.params.privateKey);

		return res.status(200).json(createResponse(deleteFile, null, false, null));
	} catch (error) {
		_log(error, 'red');
		return next(new Error(error));
	}
};

module.exports = {
	createFileInfo,
	getFileByPublicKey,
	deleteFIlesByPrivateKey,
};
