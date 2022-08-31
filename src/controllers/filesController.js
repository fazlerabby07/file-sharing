const _log = require('../utils/logger');
const filesService = require('../services/files');
const _p = require('../helpers/simpleasync');
const { createResponse } = require('../utils/responseGenerate');
const crypto = require('crypto');
const path = require('path');
const { Providers } = require('../utils/providersEnum');

const createFileInfo = async (req, res, next) => {
	if (req.file) {
		const privateKey = crypto.randomUUID();
		const publicKey = crypto.randomUUID();
		const ownerIp = req.ip.split(':').slice(-1)[0];

		const fileInfo = {
			fileName: req.file.filename,
			filePath: `/uploads/${req.file.filename}`,
			privateKey,
			publicKey,
			ownerIp,
		};

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
	const [fileErr, file] = await _p(filesService.getFileByPublicKey(req.params.publicKey));
	if (fileErr) {
		_log(fileErr, 'red');
		return next(new Error('File fetching failed'));
	}
	if (!file)
		return res.status(200).json(createResponse({}, 'No file found using this public key', false, null));

	if (process.env.PROVIDER === Providers.LOCAL) {
		const ip = req.ip.split(':').slice(-1)[0];

		filesService.updateFileById(file._id, ip);
	
		const filePath = path.join(__dirname, `../${file.filePath}`);
		return res.sendFile(filePath);
	}

	return res.status(200).json(createResponse({}, 'No file found using this public key', false, null));
};

const deleteFIlesByPrivateKey = async (req, res, next) => {
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
