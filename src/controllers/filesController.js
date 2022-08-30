const _log = require('../utils/logger');
const filesService = require('../services/files');
const _p = require('../helpers/simpleasync');
const { createResponse } = require('../utils/responseGenerate');
const crypto = require('crypto');

const createFileInfo = async (req, res, next) => {
	const privateKey = crypto.randomUUID();
	const publicKey = crypto.randomUUID();
	const ownerIp = req.ip.split(':').slice(-1)[0];
	const reqBody = req.body;
	const fileInfo = {
		...reqBody,
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
};

const getFileByPublicKey = async (req, res, next) => {
	const [fileErr, file] = await _p(filesService.getFileByPublicKey(req.params.publicKey));
	if (fileErr) {
		_log(fileErr, 'red');
		return next(new Error('File fetching failed'));
	}

	const ip = req.ip.split(':').slice(-1)[0];

	console.log('-----', ip);
	filesService.updateFileById(file._id, ip);
	return res.status(200).json(createResponse(file, null, false, null));
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
