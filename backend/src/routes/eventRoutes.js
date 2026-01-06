const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', eventController.ingestEvent);
router.get('/', eventController.getEvents);
router.post('/batch', upload.single('file'), eventController.batchUpload);

module.exports = router;
