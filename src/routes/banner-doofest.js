const express = require('express');
const router = express.Router();

const controller = require('../controllers/banner-doofest');


router.get('/banner-doofest', controller.getBannerData)
router.post('/banner-doofest', controller.postBannerData)

module.exports = router;