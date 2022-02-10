const firebase = require('../config/firebase');
const { promises: fs } = require('fs');
const { IncomingForm } = require('formidable');
const ImageKit = require('imagekit');
const { parseBool, formData } = require('../config/Helper');

const database = firebase.app().database()

exports.getFlashSaleList = async (req, res, next) => {
  const { isDetail = null, isUpdate = null, type = null, id = null } = req.query;

  if (isDetail === '1') {
    try {
      const getData = await database.ref(`/flashSale/${id}`).once('value')
      const listData = getData.val()

      const getPackageProducts = await database.ref(`/products/venuePackage`).once('value')
      const listPackage = getPackageProducts.val()
      const dataPackageProducts = Object.entries(listPackage).map(([key, value]) => ({
          listID: key,
          ...value,
      }))

      const getMembershipProducts = await database.ref(`/products/memberships`).once('value')
      const listMembership = getMembershipProducts.val()
      const dataMembershipProducts = Object.entries(listMembership).map(([key, value]) => ({
          listID: key,
          ...value,
      }))

      const dataMembership = []
      const dataPackage = []

      for (let i = 0; i < dataPackageProducts.length; i++) {
          for (let j = 0; j < listData.products.venuePackage.length; j++) {
            if (listData.products.venuePackage[j] === dataPackageProducts[i]?.ID) {
                dataPackage.push({
                  id: dataPackageProducts[i]?.ID,
                  name: dataPackageProducts[i]?.name,
                })
            }
          }
      }

      for (let i = 0; i < dataMembershipProducts.length; i++) {
          for (let j = 0; j < listData.products.membership.length; j++) {
            if (listData.products.membership[j] === dataMembershipProducts[i]?.ID) {
                dataMembership.push({
                  id: dataMembershipProducts[i]?.ID,
                  name: dataMembershipProducts[i]?.name,
                })
            }
          }
      }

      return res.status(200).json({
          message: 'Data retrieved',
          data: { ...listData, dataMembershipID: dataMembership, dataPackageID: dataPackage },
      })
    } catch (error) {
      return res.status(500).json({
          status: 500,
          message: error.message,
      })
    }
  }

  try {
    const getList = await database.ref(`/flashSale`).once('value')
    const list = getList.val()

    return res.status(200).json({
        status: 200,
        message: 'Success Get Data',
        data: list,
    })
  } catch (err) {
    return res.status(500).json({
        status: 500,
        message: err.message,
    })
  }
}

exports.deleteFlashSale = async (req, res, next) => {
  const { isDetail = null, isUpdate = null, type = null, id = null } = req.query;
  try {
    let getData = await database.ref(`/flashSale/${id}`)
    getData.remove()

    const listData = await database.ref(`/flashSale`).once('value')

    return res.status(200).json({
        message: 'Data Deleted',
        body: listData.val(),
    })
  } catch (error) {
    return res.status(500).json({
        status: 500,
        message: error.message,
    })
  }
}

exports.postFlashSale = async (req, res, next) => {
  const data = await formData(req)
  try {
    const getList = await database.ref(`/flashSale`)
    const list = getList.push()

    const payload = {
        title: data?.fields?.title,
        startTime: data?.fields?.startTime,
        endTime: data?.fields?.endTime,
        products: '',
    }

    await list.set(payload)
    return res.status(200).json({
        status: 200,
        message: 'Success Add Data',
        data: list,
    })
  } catch (error) {
    return res.status(500).json({
        status: 500,
        message: error.message,
    })
  }
}

exports.updateFlashSale = async (req, res, next) => {
  const { isDetail = null, isUpdate = null, type = null, id = null, expand = null } = req.query;
  const data = await formData(req)

  if (isUpdate === '1') {
    try {
      const db = await database.ref(`/flashSale/${id}`)

      const payload = {
          title: data?.fields?.title,
          startTime: data?.fields?.startTime,
          endTime: data?.fields?.endTime,
      }

      db.update(payload)

      return res.status(200).json({
          status: 200,
          message: 'Data Updated',
          data: body,
      })
    } catch (error) {
      return res.status(500).json({
          status: 500,
          message: error.message,
      })
    }
  }

  if (expand === 'expand') {
    try {
      const db = await database.ref(`/flashSale/${id}/products`)

      const payload = {
          membership: '',
          venuePackage: '',
      }

      db.set(payload)

      return res.status(200).json({
          status: 200,
          message: 'Data Updated',
          data: body,
      })
    } catch (error) {
      return res.status(500).json({
          status: 500,
          message: error.message,
      })
    }
  }

  if (type === 'membership') {
    try {
      const db = await database.ref(`/flashSale/${id}/products/${type}`)

      const dataNumber = []

      for (let i = 0; i < Object.keys(data?.fields).length; i++) {
          dataNumber.push(Number(data?.fields[i]))
      }

      db.set(dataNumber)

      return res.status(200).json({
          message: 'Data Updated',
          data: body,
      })
    } catch (error) {
      return res.status(500).json({
          status: 500,
          message: error.message,
      })
    }
  }

  if (type === 'venuePackage') {
    try {
      const db = await database.ref(`/flashSale/${id}/products/${type}`)

      const dataNumber = []

      for (let i = 0; i < Object.keys(data?.fields).length; i++) {
          dataNumber.push(Number(data?.fields[i]))
      }

      db.set(dataNumber)

      return res.status(200).json({
          message: 'Data Updated',
          data: body,
      })
    } catch (error) {
      return res.status(500).json({
          status: 500,
          message: error.message,
      })
    }
  }
}