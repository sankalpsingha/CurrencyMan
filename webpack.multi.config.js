const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const fs = require('fs');

// Helper function to merge JSON files
function mergeJsonFiles(file1, file2) {
  const json1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
  const json2 = JSON.parse(fs.readFileSync(file2, 'utf8'));
  return JSON.stringify({ ...json1, ...json2 }, null, 2);
}

// Common webpack configuration
const commonConfig = {
  entry: {
    content: './src/content/content.js',
    background: './src/background/background.js',
    popup: './src/popup/popup.js'
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
};

// Chrome-specific configuration
const chromeConfig = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist-chrome'),
    filename: '[name].js'
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
      filename: 'currencyman-chrome.zip',
      pathPrefix: '',
      pathMapper: function(assetPath) {
        return assetPath;
      },
      exclude: [/\.map$/, /\.DS_Store$/],
    }),
  ],
};

// Firefox-specific configuration
const firefoxConfig = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist-firefox'),
    filename: '[name].js'
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
            const firefoxManifest = JSON.parse(fs.readFileSync('src/manifests/firefox.json', 'utf8'));
            return JSON.stringify({ ...commonManifest, ...firefoxManifest }, null, 2);
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
      filename: 'currencyman-firefox.zip',
      pathPrefix: '',
      pathMapper: function(assetPath) {
        return assetPath;
      },
      exclude: [/\.map$/, /\.DS_Store$/],
    }),
  ],
};

// Export configurations based on environment variable
module.exports = (env) => {
  // Default to building both if no specific browser is specified
  if (!env || (!env.browser)) {
    console.log('Building for both Chrome and Firefox...');
    return [
      merge(commonConfig, chromeConfig),
      merge(commonConfig, firefoxConfig)
    ];
  }
  
  // Build for specific browser
  if (env.browser === 'chrome') {
    console.log('Building for Chrome only...');
    return merge(commonConfig, chromeConfig);
  }
  
  if (env.browser === 'firefox') {
    console.log('Building for Firefox only...');
    return merge(commonConfig, firefoxConfig);
  }
  
  // Fallback to building both
  console.log('Unknown browser specified, building for both Chrome and Firefox...');
  return [
    merge(commonConfig, chromeConfig),
    merge(commonConfig, firefoxConfig)
  ];
};
