import path from 'path';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';

export default {
    profile: true,
    target: 'node',
    context: path.join(__dirname, '..'),
    entry: {
        server: path.join(__dirname, '..', 'bin', 'www.js')
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '..', 'dist', 'www')
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|gif|ico)$/,
                use: ['file-loader?name=[name].[ext]']
            },
            {
                test: /\.js$/,
                use: ['babel-loader']
            },
            {
                test: /\.ejs$/,
                use: ['file-loader?name=views/[name].[ext]']
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist/www']),
        //new UglifyJSPlugin()
    ]
};