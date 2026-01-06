const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/ruleController');

router.get('/', ruleController.getRules);
router.put('/:type', ruleController.updateRule);

module.exports = router;
