const express = require('express');
const router = express.Router();

const controller = require('../controllers/products');

router.get('/product', controller.getProductList);
router.get('/product/:productType', controller.getProductListByType);
router.post('/product/:productType', controller.createProduct);
router.patch('/product/:productType', controller.updateProduct);
router.delete('/product/:productType', controller.deleteProduct);

module.exports = router;