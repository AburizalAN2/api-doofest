require('dotenv').config()
const express = require('express');
const path = require('path');
const app = express();

const bannerRoutes = require('./src/routes/banner-doofest');
const productsRoutes = require('./src/routes/products');
const flashSaleRoutes = require('./src/routes/flashsale');

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001, http://localhost:3000, https://dashboard.doogether.tech, https://dashboard.doogether.id');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// {base_url}/api/banner-doofest
app.use('/api', bannerRoutes);

// {base_url}/api/products
app.use('/api', productsRoutes);

// {base_url}/api/flashsale
app.use('/api', flashSaleRoutes);


app.listen('4000', () => {
  console.log('connected to port 4000')
})