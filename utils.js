const { format, parse } = require('path')

const changePathExtension = (path, newExt) =>
  format({
    ...parse(path),
    base: '',
    ext: `.${newExt}`
  })

module.exports = {
  changePathExtension
}
