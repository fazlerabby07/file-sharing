const _log = require('../utils/logger');
const filesService = require('../services/files');
const _p = require('../helpers/simpleasync');
const { createResponse } = require('../utils/responseGenerate');
const crypto = require('crypto');
const path = require('path');
const { Providers } = require('../utils/providersEnum');
const fs = require('fs');

const createFileInfo = async (req, res, next) => {
	if (req.file) {
		const privateKey = crypto.randomUUID();
		const publicKey = crypto.randomUUID();
		const ownerIp = req.ip.split(':').slice(-1)[0];

		// check if user ip address exist the upload file
		const [err, uploadCount] = await _p(filesService.findTotalUploadByIpAddress(ownerIp));

		if (err) {
			_log(err, 'red');
			return next(new Error('File fetching failed'));
		}

		// if exist the limit then remove the file form local and give an error response
		if (uploadCount >= process.env.DAILY_UPLOAD_LIMIT) {
			const filePath = path.join(__dirname, `../uploads/${req.file.filename}`);
			fs.unlinkSync(filePath);

			return res
				.status(400)
				.json(createResponse(null, 'you already exceeded the upload limit for today', true, null));
		}

		const fileInfo = {
			fileName: req.file.filename,
			filePath: `/uploads/${req.file.filename}`,
			privateKey,
			publicKey,
			ownerIp,
		};

		// If all condition passed then create file information in DB
		const [fileErr, file] = await _p(filesService.createFile(fileInfo));

		if (fileErr) {
			_log(userErr, 'red');
			return next(new Error(userErr));
		}
		return res.status(201).json(createResponse(file, 'file created successfully', false, null));
	} else {
		_log('Need to provide file', 'red');
		return next(new Error('Need to provide file'));
	}
};

const getFileByPublicKey = async (req, res, next) => {

	// split the ip 
	const ip = req.ip.split(':').slice(-1)[0];

	// check if user have limit to download files
	const [err, downloadCount] = await _p(filesService.findTotalDownloadByIpAddress(ip));

	if (err) {
		_log(err, 'red');
		return next(new Error('File fetching failed'));
	}

	// if user exist the limit then send error response 
	if (downloadCount >= process.env.DAILY_DOWNLOAD_LIMIT) {
		return res
			.status(400)
			.json(createResponse(null, 'you already exceeded the download limit for today', true, null));
	}

	// get file info using file public key
	const [fileErr, file] = await _p(filesService.getFileByPublicKey(req.params.publicKey));
	if (fileErr) {
		_log(fileErr, 'red');
		return next(new Error('File fetching failed'));
	}
	if (!file)
		return res.status(200).json(createResponse({}, 'No file found using this public key', false, null));

	if (process.env.PROVIDER === Providers.LOCAL) {
		filesService.updateFileById(file._id, ip);

		const filePath = path.join(__dirname, `../${file.filePath}`);
		return res.sendFile(filePath);
	}

	return res.status(200).json(createResponse({}, 'No file found using this public key', false, null));
};

const deleteFIlesByPrivateKey = async (req, res, next) => {
	// delete file info using file private key
	const [fileErr, file] = await _p(filesService.deleteFileByPrivateKey(req.params.privateKey));
	if (fileErr) {
		_log(fileErr, 'red');
		return next(new Error('file delete failed'));
	}
	return res.status(200).json(createResponse(file, null, false, null));
};

module.exports = {
	createFileInfo,
	getFileByPublicKey,
	deleteFIlesByPrivateKey,
};
