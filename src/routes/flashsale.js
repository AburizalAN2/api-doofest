const express = require('express');
const router = express.Router();

const controller = require('../controllers/flashsale');

router.get('/flashsale', controller.getFlashSaleList);
router.post('/flashsale', controller.postFlashSale);
router.patch('/flashsale', controller.updateFlashSale);
router.delete('/flashsale', controller.deleteFlashSale);

module.exports = router;