const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/es6.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
