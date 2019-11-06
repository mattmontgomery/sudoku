const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src", "index.js"),
  output: { path: path.resolve(__dirname, "dist") },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.ejs")
    })
  ],
  devServer: {
    index: `index.html`,
    contentBase: path.resolve(__dirname, "dist"),
    open: true
  },
  mode: "development"
};
