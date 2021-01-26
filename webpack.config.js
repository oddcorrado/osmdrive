module.exports = {
    resolve: {
        extensions: [".ts", ".js"],
    },
    node: {
        fs: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            },
        ],
    }
}
