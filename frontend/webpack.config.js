module.exports = {
  // ...
  resolve: {
      fallback: {
        util: require.resolve("util/"),
        cacheManager: require.resolve("cache-manager/"),
        http: require.resolve("stream-http"),
        https: require.resolve('https-browserify/'),
        classTransformer: require.resolve("class-transformer/"),
        classValidator: require.resolve("class-validator/"),
        stream: require.resolve("stream/")
      }
  }
  // ...
};