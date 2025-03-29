const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    content: './content.js',
    background: './background.js',
    popup: './popup.js'
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
          from: 'manifest.json', 
          to: '.' 
        },
        { 
          from: 'popup.html', 
          to: '.' 
        },
        { 
          from: 'styles.css', 
          to: '.',
          transform(content) {
            return content.toString().replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/\s+/g, ' ').trim();
          },
        },
        { 
          from: 'icons', 
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
