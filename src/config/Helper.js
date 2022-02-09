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
