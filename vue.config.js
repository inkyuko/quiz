module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'https://tata.oddm.co.kr',
            }
        }
    },
    publicPath: '/quiz/dist/',
    productionSourceMap: false
}
