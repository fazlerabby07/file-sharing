const Files = require('../models/files');

const createFile = async (fileInfo) => {
	try {
		const newFileInfo = await Files.create(fileInfo);
		return {
			publicKey: newFileInfo.publicKey,
			privateKey: newFileInfo.privateKey,
		};
	} catch (error) {
		throw new Error(error);
	}
};

const getFileByKey = async (query) => {
	try {
		const file = await Files.findOne(query);
		return file;
	} catch (error) {
		throw new Error(error);
	}
};

const updateFileById = async (id, downloadedIp) => {
	try {
		await Files.findByIdAndUpdate(
			{ _id: id },
			{
				$addToSet: {
					downloadInfo: {
						downloadedIp,
					},
				},
			},
			{ new: true },
		);
		return { message: 'file update successfully' };
	} catch (error) {
		throw new Error(error);
	}
};

const deleteFileByPrivateKey = async (privateKey) => {
	try {
		const fileDelete = await Files.findOneAndDelete({ privateKey });
		if (!fileDelete) throw new Error('file not found.');
		return { message: 'file delete successfully.' };
	} catch (error) {
		throw new Error(error);
	}
};

const findTotalUploadByIpAddress = async (ipAddress) => {
	try {
		const start = new Date();
		start.setHours(0, 0, 0, 0);

		const count = Files.count({ createdAt: { $gte: start } });

		return count;
	} catch (error) {
		throw new Error(error);
	}
};

const findTotalDownloadByIpAddress = async (ipAddress) => {
	try {
		const start = new Date();
		start.setHours(0, 0, 0, 0);

		const countOfSameIpAddress = await Files.aggregate([
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
		]);
		const totalFileDownload = countOfSameIpAddress.length <= 0 ? 0 : countOfSameIpAddress[0].total;
		return totalFileDownload;
	} catch (error) {
		throw new Error(error);
	}
};

const getListOfInactiveFileData = async (invalidationTime) => {
	try {
		const calculateInvalidTime = invalidationTime * 60 * 60 * 1000;
		const filesList = await Files.find({
			updatedAt: { $lte: new Date(Date.now() - calculateInvalidTime) },
		});

		return filesList;
	} catch (error) {
		throw new Error(error);
	}
};

module.exports = {
	createFile,
	getFileByKey,
	updateFileById,
	deleteFileByPrivateKey,
	findTotalUploadByIpAddress,
	findTotalDownloadByIpAddress,
	getListOfInactiveFileData,
};
