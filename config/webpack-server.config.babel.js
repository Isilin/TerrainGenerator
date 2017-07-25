import path from 'path';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';

export default {
    profile: true,
    target: 'node',
    context: path.join(__dirname, '..'),
    node: {
        __filename: false,
        __dirname: false
    },
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
                exclude: /node_modules/,
                use: ['html-loader']
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|gif|ico)$/,
                exclude: /node_modules/,
                use: ['file-loader?name=[name].[ext]']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.ejs$/,
                exclude: /node_modules/,
                use: ['ejs-compiled-loader?compileDebug&name=[name].[ext]']
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist/www']),
        //new UglifyJSPlugin()
    ]
};