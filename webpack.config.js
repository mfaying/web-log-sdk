const path = require('path');
const HappyPack = require('happypack');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

module.exports = {
  entry: {
    app: './src/index.js',
  },
  output: {
    filename: `web-log-sdk-${process.env.npm_package_version}.min.js`,
    path: path.resolve(__dirname, './lib'),
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  devtool: 'cheap-module-eval-source-map',
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.js', '.json'],
    mainFields: ['jsnext:main', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['eslint-loader'],
        include: path.resolve(__dirname, 'src'),
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        use: [{
          loader: 'happypack/loader',
          options: {
            id: 'babel',
          }
        }],
        include: path.resolve(__dirname, 'src'),
      },
    ]
  },
  plugins: [
    new HappyPack({
      id: 'babel',
      loaders: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        }
      }],
    }),
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
      SDK_VERSION: JSON.stringify(process.env.npm_package_version)
    }),
    new ModuleConcatenationPlugin(),
  ]
};