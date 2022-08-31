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

const findTotalUploadByIpAddress = async (ipAddress) => {
	return new Promise(async (resolve, reject) => {
		const start = new Date();
		start.setHours(0, 0, 0, 0);

		const [fileErr, count] = await _p(Files.count({ createdAt: { $gte: start } }));

		if (fileErr) return reject(fileErr);
		return resolve(count);
	});
};

const findTotalDownloadByIpAddress = async (ipAddress) => {
	return new Promise(async (resolve, reject) => {
		const start = new Date();
		start.setHours(0, 0, 0, 0);

		const [fileErr, count] = await _p(
			Files.aggregate([
				{
					$match: {
						$and: [
							{ 'downloadInfo.downloadedIp': ipAddress },
							{ 'downloadInfo.createdAt': { $gte: start } },
						],
					},
				},
				{
					$group: {
						_id: null,
						total: {
							$sum: {
								$size: {
									$filter: {
										input: '$downloadInfo',
										as: 'el',
										cond: {
											$eq: ['$$el.downloadedIp', ipAddress],
										},
									},
								},
							},
						},
					},
				},
			]),
		);
		if (fileErr) return reject(fileErr);

		const totalFileDownload = count.length <= 0 ? 0 : count[0].total;
		console.log(totalFileDownload);

		return resolve(totalFileDownload);
	});
};

module.exports = {
	createFile,
	getFileByPublicKey,
	updateFileById,
	deleteFileByPrivateKey,
	findTotalUploadByIpAddress,
	findTotalDownloadByIpAddress,
};
