const cron = require('node-cron');
const fileService = require('../services/files');
const _p = require('../helpers/simpleasync');
const _log = require('../utils/logger');
const fs = require('fs');
const path = require('path');

const cronStart = cron.schedule('* * * * *', async () => {
	console.log('Inside cron: ', new Date());
	// find data which is not download with in 24 hours
	const [fileErr, getInactiveFiles] = await _p(
		fileService.getListOfInactiveFileData(process.env.PERIOD_OF_INACTIVITY),
	);
	if (fileErr) {
		_log('Can not fetch data for cron job', 'red');
	}

  // checking the length of the file list if length is empty then return
	if (getInactiveFiles.length <= 0) return;

	getInactiveFiles.forEach(async (file) => {
		// delete file from local dir
		const filePath = path.join(__dirname, `../${file.filePath}`);
		fs.unlinkSync(filePath);

		// delete the record from DB
		await fileService.deleteFileByPrivateKey(file.privateKey);
	});
});

module.exports = cronStart;