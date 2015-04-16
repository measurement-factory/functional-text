/*eslint-env node*/
var webpack = require("webpack");
var path = require("path");
var fs = require("fs");

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1; // XXX: identical to x !== ".bin"?
  })
  .forEach(function(mod) {
    nodeModules[mod] = mod;
  });

module.exports = {
    entry: "./src/Parser.js",
    output: {
        path: path.join(__dirname, "build"),
        libraryTarget: "umd",
        filename: "bundle.js"
    },
    plugins: [
        new webpack.optimize.DedupePlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: [
                    "babel-loader"
                ]
            }
        ]
    },
    externals: nodeModules,
    target: "node",
    devtool: "source-map"
};