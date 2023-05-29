const { join } = require('path')

module.exports = {
  '@root' : join(__dirname, 'src'),
  '@core' : join(__dirname, 'src', 'core'),
  '@assets' : join(__dirname, 'src', 'assets'),
  '@main' : join(__dirname, 'src', 'main'),
  '@settings' : join(__dirname, 'src', 'settings'),
  '@details' : join(__dirname, 'src', 'details'),
  '@create' : join(__dirname, 'src', 'create'),
  '@timer' : join(__dirname, 'src', 'timer'),
  '@locales' : join(__dirname, 'src', 'locales'),
};