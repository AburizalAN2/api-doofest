require('dotenv').config()
const express = require('express');
const path = require('path');
const app = express();

const bannerRoutes = require('./src/routes/banner-doofest');

app.use(express.json());

app.use('/api', bannerRoutes);

app.listen('4000', () => {
  console.log('connected to port 4000')
})