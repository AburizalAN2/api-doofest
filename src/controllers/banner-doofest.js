const firebase = require('../config/firebase');
const ImageKit = require('imagekit');
const { IncomingForm } = require('formidable');
const { promises: fs } = require('fs');
const { parseBool } = require('../config/Helper');

exports.getBannerData = async (req, res, next) => {
  try {
    const db = await firebase.app().database().ref('/banners').once('value')
    const data = db.val()
    res.status(200).json({
      message: 'Success Add Data',
      data: data,
    })
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: 'Failed Add Data',
      err: err.message
    })
  }
  next();
}

exports.postBannerData = async (req, res, next) => {
  try {
    const getList = await firebase.app().database().ref('/banners/header')
    const list = getList.push()
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm()
      form.parse(req, (err, fields, files) => {
          if (err) return reject(err)
          resolve({ fields, files })
      })
    })
    const contents = await fs.readFile(data?.files?.image.filepath)
    
    const uploadImage = await new Promise((resolve, reject) => {
      const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      })
  
      imagekit.upload(
        {
            file: contents,
            fileName: 'banner.jpg',
            folder: 'web-festival/banners',
        },
        (error, result) => {
            if (error) {
              // console.log('error', error)
              reject({
                  success: false,
                  message: 'Oops, error when upload image',
                  data: error,
              })
            } else {
              resolve({
                  success: true,
                  message: 'Success Add Data',
                  data: result,
              })
            }
        }
      )
    })
  
    if (uploadImage?.success) {
      const payload = {
          imageURL: uploadImage?.data.url,
          isRedirect: parseBool(data?.fields?.isRedirect),
          redirectURL: data?.fields?.redirectURL,
      }
      await list.set(payload)
      res.status(200).json({
          status: 200,
          message: 'Success Add Data',
          data: payload,
      })
    } else {
      res.status(400).json({
          status: 400,
          ...uploadImage,
      })
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: 'Failed Add Data',
      err: err.message
    })
  }  
  next();
}