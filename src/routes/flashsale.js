const express = require('express');
const router = express.Router();

const controller = require('../controllers/flashsale');

router.get('/flashsale', controller.getFlashSaleList);

module.exports = router;