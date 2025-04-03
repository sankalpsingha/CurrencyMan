const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const fs = require('fs');

module.exports = {
  mode: 'development',
  entry: {
    content: './src/content/content.js',
    background: './src/background/background.js',
    popup: './src/popup/popup.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist-dev'),
    filename: '[name].js'
  },
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { 
          from: 'src/manifests/common.json',
          to: 'manifest.json',
          transform(content) {
            const commonManifest = JSON.parse(content.toString());
            const chromeManifest = JSON.parse(fs.readFileSync('src/manifests/chrome.json', 'utf8'));
            return JSON.stringify({ ...commonManifest, ...chromeManifest }, null, 2);
          }
        },
        { 
          from: 'src/popup/popup.html', 
          to: '.' 
        },
        { 
          from: 'src/styles/styles.css', 
          to: 'styles.css'
        },
        { 
          from: 'assets/icons', 
          to: 'icons',
          globOptions: {
            ignore: ['**/README.txt', '**/.DS_Store'],
          },
        },
      ],
    }),
  ],
};
