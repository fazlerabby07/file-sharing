const router = require('express').Router();

// controller
const health = require('./controllers/healthController');

// System Routes
router.get('/health', health.check);

module.exports = router;
