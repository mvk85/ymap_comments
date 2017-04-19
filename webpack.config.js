var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require('path');
//var LiveReloadPlugin = require('webpack-livereload-plugin');
//var webpack = require('webpack');

module.exports = {
    entry: {
        main: ["./src/index.js"]
    },
    output: {
        filename: '[hash].js',
        path: __dirname + '/dist',
        //publicPath: '/'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['es2015'],
                }
            },
            {
                test: /\.(jpeg|jpg|png|gif|svg|)$/,
                loader: 'file-loader?name=img/[name].[ext]'
            },
            {
                test: /\.scss$/,
                loader: ["style-loader", "css-loader", "sass-loader"]
                /*use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader?minimize', 'sass-loader']
                })*/
            },
            {
                test: /\.hbs/,
                loader: 'handlebars-loader',
                exclude: 'node_modules',
                query: {
                    partialDirs: [
                        path.join(__dirname, 'src')
                    ],
                    inlineRequires: '/img/'
                }
            }
        ]
    },
    devServer: {
        //hot: true
    },
    plugins: [
        new HtmlPlugin({
            title: 'VK plagin',
            template: './src/index.hbs',
            chunks: ['main']
        }),
        new ExtractTextPlugin('css/style.[hash:5].css'),
        //new webpack.HotModuleReplacementPlugin(),
        //new LiveReloadPlugin(),
        new CleanWebpackPlugin(['dist']/*, {
            verbose: true
        }*/)
    ]
};