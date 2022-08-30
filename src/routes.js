const router = require('express').Router();

// controller
const health = require('./controllers/healthController');
const filesController = require('./controllers/filesController');

// System Routes
router.get('/health', health.check);

//files Routes
router.post('/files', filesController.createFileInfo);
router.get('/files/:publicKey', filesController.getFileByPublicKey);
router.delete('/files/:privateKey', filesController.deleteFIlesByPrivateKey);

module.exports = router;
