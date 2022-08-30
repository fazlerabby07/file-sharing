const express = require('express');
const routes = require('./routes');
const app = express();
const cors = require('cors');

const errorHandler = require('./middlewares/errors');
require('dotenv').config();
require('./configs/db');

app.use(express.json());
app.use(cors());

// Load Routes
app.use(routes);

// Error handler
app.use(errorHandler);

// Listen to the Port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`listening on ${PORT}`);
});

module.exports = app;
