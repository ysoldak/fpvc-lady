var pjson = require('./package.json');
var fs = require('fs-extra')

var oldPath = './build/'

fs.move(oldPath, pjson.buildDir, function (err) {
  if (err) throw err
  console.debug('Successfully moved build directory.')
})