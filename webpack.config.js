module.export = {
    watch: true,
    progress: true,
    debug: true,
    stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
    },
    entry: ['babel-polyfill', './public/app/scripts/app.routes.js'],
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                exclude: /(node_modules|bower_components)/,
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                        plugins: ['transform-runtime']
                    }
                }
            }
        ]
    }
};