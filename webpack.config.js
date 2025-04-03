const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const fs = require('fs');

module.exports = {
  mode: 'production',
  entry: {
    content: './src/content/content.js',
    background: './src/background/background.js',
    popup: './src/popup/popup.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
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
          to: 'styles.css',
          transform(content) {
            return content.toString().replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/\s+/g, ' ').trim();
          },
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
    new ZipPlugin({
      filename: 'currencyman.zip',
      pathPrefix: '',
      pathMapper: function(assetPath) {
        return assetPath;
      },
      exclude: [/\.map$/, /\.DS_Store$/],
    }),
  ],
};
