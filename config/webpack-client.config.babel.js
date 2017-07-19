import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';

export default {
    profile: true,
    target: 'node',
    context: path.join(__dirname, '..'),
    entry: {
        client: path.join(__dirname, '..', 'public', 'app', 'scripts', 'app.routes.js')
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '..', 'dist', 'public')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|gif|ico)$/,
                use: ['file-loader']
            },
            {
                test: /\.js$/,
                use: ['babel-loader']
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist/public']),
        new HtmlWebpackPlugin({
            template: 'public/app/index.html',
            title: 'Together',
            filename: 'index.html',
            inject: 'body',
            excludeChunks: [],
            minify: {
                html5: true,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true,
                useShortDoctype: true
            }
        }),
        new UglifyJSPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ]
};