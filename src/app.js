const express = require('express');
const routes = require('./routes');
const app = express();
const cors = require('cors');
const path = require('path');

const errorHandler = require('./middlewares/errors');


app.use(express.json());
app.use(cors());

// Load Routes
app.use(routes);

// file path to serve image
app.use(express.static(path.join(__dirname, `${process.env.FOLDER}`)));

// Error handler
app.use(errorHandler);


module.exports = app;