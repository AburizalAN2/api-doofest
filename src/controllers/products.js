const firebase = require('../config/firebase');
const { promises: fs } = require('fs');
const { IncomingForm } = require('formidable');
const ImageKit = require('imagekit');
const { parseBool, formData } = require('../config/Helper');

const database = firebase.app().database()

exports.getProductList = async (req, res, next) => {
  try {
    const getList = await database.ref(`/products`).once('value')
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

exports.getProductListByType = async (req, res, next) => {
  console.log(req.query)
  const { productType } = req.params
  const { isSports = null, isDetail = null, id = null } = req.query

  if (isSports === '1') {
    try {
      const getDataSportsID = await database.ref(`/products/${productType}/${id}/sportID`).once('value')
      const getDataSports = await database.ref(`/products/${productType}/${id}/sports`).once('value')
      const listSportsData = getDataSports.val()
      const listDataID = getDataSportsID.val()
      const datas = []

      for (let i = 0; i < listSportsData?.length; i++) {
          datas.push({
            id: Number(listDataID[i]),
            name: listSportsData[i],
          })
      }

      return res.status(200).json({
          message: 'Data retrieved',
          data: datas,
      })
    } catch (error) {
      return res.status(500).json({
          status: 500,
          message: error.message,
      })
    }
  } else if (isDetail === '1') {
    try {
      const getData = await database.ref(`/products/${productType}/${id}`).once('value')
      const listData = getData.val()

      return res.status(200).json({
          message: 'Data retrieved',
          data: listData,
      })
    } catch (error) {
      return res.status(500).json({
          status: 500,
          message: error.message,
      })
    }
  } else {
    try {
      const productType = await req.params.productType
      const getData = await database.ref(`/products/${productType}`).once('value')
      const listData = getData.val()
  
      return res.status(200).json({
          status: 200,
          message: 'Data retrieved',
          data: listData,
      })
    } catch (error) {
      return res.status(500).json({
          status: 500,
          message: error.message,
      })
    }
  }
}

exports.createProduct  = async (req, res, next) => {
  const { productType } = req.params
  const data = await formData(req)
  const contents = await fs.readFile(data?.files?.imageURL?.filepath)
  try {
      const getList = await database.ref(`/products/${productType}`)
      const list = getList.push()
      const uploadImage = await new Promise((resolve, reject) => {
        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        })

        imagekit.upload(
            {
              file: contents,
              fileName: productType === 'memberships' ? 'memberships.jpg' : 'venuePackage.jpg',
              folder: productType === 'memberships' ? 'web-festival/product-membership' : 'web-festival/product-venuePackage',
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
        const payloadMemberships = {
            ID: Number(data?.fields?.ID),
            bought: Number(data?.fields?.bought),
            // discountID: Number(data?.fields?.discountID),
            discountValue: Number(data?.fields?.discountValue),
            isShowOnBestDeal: parseBool(data?.fields?.isShowOnBestDeal),
            isDiscountPercentage: parseBool(data?.fields?.isDiscountPercentage),
            imageURL: uploadImage?.data.url,
            name: data?.fields?.name,
            period: Number(data?.fields?.period),
            price: Number(data?.fields?.price),
            productType: Number(data?.fields?.productType),
            quota: Number(data?.fields?.quota),
            published: parseBool(data?.fields?.published),
            typeLabel: data?.fields?.typeLabel,
        }

        const payloadVenuePackage = {
            ID: Number(data?.fields?.ID),
            bought: Number(data?.fields?.bought),
            // discountID: Number(data?.fields?.discountID),
            discountValue: Number(data?.fields?.discountValue),
            isShowOnBestDeal: parseBool(data?.fields?.isShowOnBestDeal),
            isDiscountPercentage: parseBool(data?.fields?.isDiscountPercentage),
            imageURL: uploadImage?.data.url,
            name: data?.fields?.name,
            price: Number(data?.fields?.price),
            productType: Number(data?.fields?.productType),
            quota: Number(data?.fields?.quota),
            published: parseBool(data?.fields?.published),
            sportID: '',
            sports: '',
            venue: data?.fields?.venue,
            venueID: Number(data?.fields?.venueID),
        }

        await list.set(productType === 'venuePackage' ? payloadVenuePackage : payloadMemberships)
        return res.status(200).json({
            status: 200,
            message: 'Success Add Data',
            data: productType === 'venuePackage' ? payloadVenuePackage : payloadMemberships,
        })
      } else {
        return res.status(400).json({
            status: 400,
            ...uploadImage,
        })
      }
  } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err.message,
      })
  }
}

exports.updateProduct = async (req, res, next) => {
  const { productType } = req.params
  const { id = null, category = null, isUpdate = null } = req.query
  const data = await formData(req)
  const contents = await fs.readFile(data?.files?.imageURL?.filepath)

  if (isUpdate === '1') {
    try {
        const getList = await database.ref(`/products/${productType}/${id}`)
        const uploadImage = await new Promise((resolve, reject) => {
          const imagekit = new ImageKit({
              publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
              privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
              urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
          })

          imagekit.upload(
              {
                file: contents,
                fileName: productType === 'memberships' ? 'memberships.jpg' : 'venuePackage.jpg',
                folder: productType === 'memberships' ? 'web-festival/product-membership' : 'web-festival/product-venuePackage',
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
          const payloadMemberships = {
              ID: Number(data?.fields?.ID),
              bought: Number(data?.fields?.bought),
              // discountID: Number(data?.fields?.discountID),
              discountValue: Number(data?.fields?.discountValue),
              isShowOnBestDeal: parseBool(data?.fields?.isShowOnBestDeal),
              isDiscountPercentage: parseBool(data?.fields?.isDiscountPercentage),
              imageURL: uploadImage?.data.url,
              name: data?.fields?.name,
              period: Number(data?.fields?.period),
              price: Number(data?.fields?.price),
              productType: Number(data?.fields?.productType),
              quota: Number(data?.fields?.quota),
              published: parseBool(data?.fields?.published),
              typeLabel: data?.fields?.typeLabel,
          }

          const payloadVenuePackage = {
              ID: Number(data?.fields?.ID),
              bought: Number(data?.fields?.bought),
              // discountID: Number(data?.fields?.discountID),
              discountValue: Number(data?.fields?.discountValue),
              isShowOnBestDeal: parseBool(data?.fields?.isShowOnBestDeal),
              isDiscountPercentage: parseBool(data?.fields?.isDiscountPercentage),
              imageURL: uploadImage?.data.url,
              name: data?.fields?.name,
              price: Number(data?.fields?.price),
              productType: Number(data?.fields?.productType),
              quota: Number(data?.fields?.quota),
              published: parseBool(data?.fields?.published),
              sportID: '',
              sports: '',
              venue: data?.fields?.venue,
              venueID: Number(data?.fields?.venueID),
          }

          await getList.set(productType === 'venuePackage' ? payloadVenuePackage : payloadMemberships)
          return res.status(200).json({
              status: 200,
              message: 'Success Add Data',
              data: productType === 'venuePackage' ? payloadVenuePackage : payloadMemberships,
          })
        } else {
          return res.status(400).json({
              status: 400,
              ...uploadImage,
          })
        }
    } catch (err) {
        return res.status(500).json({
          status: 500,
          message: err.message,
        })
    }
  }
  
  if (category === 'sportID') {
    try {
      const db = await database.ref(`/products/${productType}/${id}/sportID`)

      db.set(data?.fields)

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
  
  if (category === 'sports') {
    try {
      const db = await database.ref(`/products/${productType}/${id}/sports`)

      db.set(data?.fields)

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
  
  try {
    await database.ref(`/products/${productType}`).update({
        [`/${id}`]: body,
    })
    return res.status(200).json({
        message: 'Success Add Data',
        data: body,
    })
  } catch (err) {
    return res.status(500).json({
        status: 500,
        message: err.message,
    })
  }
}

exports.deleteProduct = async (req, res, next) => {
  const { productType } = req.params
  const { id = null } = req.query
  try {
    let getData = await database.ref(`/products/${productType}/${id}`)
    getData.remove()

    const listData = await database.ref(`/products/${productType}`).once('value')

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