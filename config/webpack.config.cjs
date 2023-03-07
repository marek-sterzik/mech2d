path = require('path');

module.exports = {
  entry: './src/eeg2d.js',
  output: {
    filename: 'eeg2d.js',
    path: path.resolve(__dirname, '../dist'),
  },
  mode: 'production'
};
