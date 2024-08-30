path = require('path');

module.exports = {
  entry: './src/webpack.js',
  output: {
    filename: 'mech2d.js',
    path: path.resolve(__dirname, '../dist'),
  },
  mode: 'production'
};
