const express = require('express');
const routes = require('./routes');
const app = express();
const cors = require('cors');
const path = require('path');

const errorHandler = require('./middlewares/errors');
require('dotenv').config();
require('./configs/db');

app.use(express.json());
app.use(cors());

// Load Routes
app.use(routes);

// file path to serve image
app.use(express.static(path.join(__dirname, `${process.env.FOLDER}`)));

// Error handler
app.use(errorHandler);

// cron job initialize
require('./services/fileCleanUpCron');

// Listen to the Port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`listening on ${PORT}`);
});

module.exports = app;
