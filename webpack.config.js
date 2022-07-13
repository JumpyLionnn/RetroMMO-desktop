const path = require('path');
const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = ({context, request}, cb) => {
    return {
        target: "node",
        entry: {
            index: "./index.ts",
            preload: "./preload.ts"
        },
        plugins: [
          new webpack.DefinePlugin({
            RELEASE: cb.mode == "production",
            DEBUG: cb.mode == "development",
          }),
          new CopyWebpackPlugin({
            patterns: [
              { 
                from: path.resolve(__dirname, 'assets/'), 
                to: path.resolve(__dirname, 'dist/assets/') 
              },
              { 
                from: path.resolve(__dirname, 'style.css'), 
                to: path.resolve(__dirname, 'dist/style.css') 
              },
            ]
          })
        ],
        module: {
            rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
        },
        
        externals: [
            (function () {
              const IGNORES = [
                'electron'
              ];
              return function (context, request, callback) {
                if (IGNORES.indexOf(request) >= 0) {
                  return callback(null, "require('" + request + "')");
                }
                return callback();
              };
            })()
        ]
    };
};