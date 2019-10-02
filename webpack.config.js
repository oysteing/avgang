const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const copyFiles = new CopyWebpackPlugin([ {
	from : 'config.xml'
}, ]);

const extractCss = new MiniCssExtractPlugin({
	filename: 'css/[name].css'
});

const htmlWebpack = new HtmlWebpackPlugin({
	template : 'src/index.html'
});

module.exports = {
	entry : [ './src/app.js' ],

	module : {
		rules : [ {
			test : /\.(s*)css$/,
			use : [ {
				loader : MiniCssExtractPlugin.loader
			}, 'css-loader', 'sass-loader' ]
		}, {
			test : /\.(png|jpe?g|svg)$/,
			loader: 'file-loader',
			options: {
				name: 'img/[name].[ext]'
			}
		} ]
	},

	plugins : [ copyFiles, extractCss, htmlWebpack ]
};