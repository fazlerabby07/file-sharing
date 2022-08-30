const Files = require('../models/files');
const _p = require('../helpers/simpleasync');

const createFile = async (fileInfo) => {
	return new Promise(async (resolve, reject) => {
		const [fileErr, file] = await _p(Files.create(fileInfo));
		if (fileErr) return reject(fileErr);
		return resolve({
			publicKey: file.publicKey,
			privateKey: file.privateKey,
		});
	});
};

const getFileByPublicKey = async (publicKey) => {
	return new Promise(async (resolve, reject) => {
		const [fileErr, file] = await _p(Files.findOne({ publicKey }));
		if (fileErr) return reject(fileErr);
		if (!file) return resolve(null);
		return resolve(file);
	});
};

const updateFileById = async (id, downloadedIp) => {
	return new Promise(async (resolve, reject) => {
		const [fileErr, file] = await _p(
			Files.findByIdAndUpdate(
				{ _id: id },
				{
					$set: { lastDownloadTime: new Date() },
					$addToSet: {
						downloadInfo: {
							downloadedIp,
						},
					},
				},
				{ new: true },
			),
		);
		if (fileErr) return reject(fileErr);
		return resolve({ message: 'file update successfully' });
	});
};

const deleteFileByPrivateKey = async (privateKey) => {
	return new Promise(async (resolve, reject) => {
		const [fileErr, _] = await _p(Files.findOneAndDelete({ privateKey }));
		if (fileErr) return reject(fileErr);
		return resolve({ message: 'file delete successfully.' });
	});
};

module.exports = {
	createFile,
	getFileByPublicKey,
	updateFileById,
	deleteFileByPrivateKey,
};
