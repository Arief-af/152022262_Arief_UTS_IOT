const express = require('express');
const router = express.Router();
const dhtController = require('../controllers/dhtController');

router.get('/dht', dhtController.getData);

module.exports = router;
