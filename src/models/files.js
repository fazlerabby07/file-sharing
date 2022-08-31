const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.Promise = global.Promise;

const filesSchema = new Schema(
	{
		fileName: {
			type: String,
			required: true,
			trim: true,
		},
		filePath: {
			type: String,
			required: true,
			trim: true,
		},
		publicKey: {
			type: String,
			required: true,
			trim: true,
		},
		privateKey: {
			type: String,
			required: true,
			trim: true,
		},
		ownerIp: {
			type: String,
			required: true,
			trim: true,
		},
		downloadInfo: {
			type: [
				{
					downloadedIp: {
						type: String,
						required: false,
					},
					createdAt: {
						type: Date,
						required: false,
						default: Date.now
					}
				},
			],
		},
		lastDownloadTime: {
			type: Date,
			required: false,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('files', filesSchema);
