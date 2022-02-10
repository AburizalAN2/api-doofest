exports.parseBool = (str) => {
  if (str === 'true' || str === true || str > 0) {
     return true
  } else if (str === 'false' || str === false || str === 0) {
     return false
  } else {
     return null
  }
}

exports.parseCurrency = (str) => {
  return new Intl.NumberFormat('id').format(str)
}


exports.formData = async (req) => (
   await new Promise((resolve, reject) => {
     const form = new IncomingForm()
     form.parse(req, (err, fields, files) => {
         if (err) return reject(err)
         resolve({ fields, files })
     })
   })
 )