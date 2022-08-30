const mongoose = require('mongoose');
const _log = require('../utils/logger');

const dbUrl = process.env.MONGODB_URI;

// check if dbUrl exist in the .env file
if (!dbUrl) {
	_log('Mongo url not set in env file', 'red');
	return new Error('Mongo url not set in env file');
}

// connecting to mongodb using mongoose
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
	if (error) {
		_log(`FAILED to connect using mongoose. ${error}`, 'red');
	} else {
		_log('Connected to DB server', 'blue');
	}
});

module.exports = mongoose;
