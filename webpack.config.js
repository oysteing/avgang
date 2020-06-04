const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const copyFiles = new CopyWebpackPlugin([
    {from: 'config.xml'},
    {from: 'src/img/icon.png'},
    // Support running Tizen Studio on dist/
    {from: '.project'},
    {from: '.tproject'}
]);

const htmlWebpack = new HtmlWebpackPlugin({
    template: 'src/index.html'
});

const tauImagePath = path.resolve('src/css/theme/changeable/images');

module.exports = {
    mode: "development",

    entry: ['./src/app.ts'],

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },

    module: {
        rules: [
/*            {
                test: /\.(tsx?|js)$/, //
                exclude: [/\/tau\.js/],
                loader: 'babel-loader',
                options: {
                    presets: [
                        ["@babel/preset-env", {"targets": {"chrome": 45}}],
                        ["@babel/preset-typescript"]
                    ],
                    plugins: ["@babel/proposal-class-properties", "@babel/plugin-transform-runtime"]
                }
            },
*/
            {
                test: /\.(tsx?)$/, //
                use: 'ts-loader',
                exclude: '/node_modules/',
            },
            {
                test: /\.(s*)css$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader
                }, 'css-loader', 'sass-loader']
            }, {
                // TAU dynamically loads images relative to CSS location
                include: tauImagePath,
                test: /\.png$/,
                loader: 'file-loader',
                options: {
                    name(file) {
                        return 'img/tau/' + path.relative(tauImagePath, file);
                    }
                }
            }, {
                exclude: tauImagePath,
                test: /\.(png|jpe?g|svg)$/,
                loader: 'file-loader',
                options: {
                    name: 'img/[name].[ext]'
                }
            }]
    },

    plugins: [copyFiles, new MiniCssExtractPlugin(), htmlWebpack],

    devtool: 'eval-source-map'
};