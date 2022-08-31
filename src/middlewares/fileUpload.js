const path = require('path');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
        const filePath = path.join(__dirname, `../${process.env.FOLDER}`);
        fs.mkdirSync(filePath, { recursive: true });
		cb(null, filePath);
	},
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const upload = multer({
	storage: storage,
});

module.exports = upload;
