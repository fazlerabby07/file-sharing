const router = require('express').Router();

// file uploader
const upload = require('./middlewares/fileUpload');

// controller
const health = require('./controllers/healthController');
const filesController = require('./controllers/filesController');

// System Routes
router.get('/health', health.check);

//files Routes
router.post('/files', upload.single('file'), filesController.createFileInfo);
router.get('/files/:publicKey', filesController.getFileByPublicKey);
router.delete('/files/:privateKey', filesController.deleteFIlesByPrivateKey);

module.exports = router;
