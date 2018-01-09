var path = require('path');
var webpack = require('webpack');
module.exports = {
  devtool: 'eval',
  devServer: {
    host: 'localhost',
    port: 3000
  },
  entry: [
    './src/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'resources'),
    filename: 'bundle.js',
    publicPath: '/resources/'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  }
}
