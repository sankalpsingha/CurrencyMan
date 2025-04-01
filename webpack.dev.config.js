const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

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
          from: 'manifest.json', 
          to: '.' 
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
