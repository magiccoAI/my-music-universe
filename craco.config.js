const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = function ({ env }) {
  const isProductionBuild = process.env.NODE_ENV === "production";
  const analyzerMode = process.env.REACT_APP_INTERACTIVE_ANALYZE
    ? "server"
    : "json";
  const plugins = [];

  if (isProductionBuild) {
    plugins.push(new BundleAnalyzerPlugin({ analyzerMode }));
  }

  return {
    webpack: {
      plugins: plugins,
      cache: {
        type: 'memory', // Disable filesystem cache to resolve stuck compilation
        buildDependencies: {
          config: [__filename],
        },
      },
      configure: (webpackConfig, { env, paths }) => {
        webpackConfig.module.rules.push({
          test: /\.ogg$/,
          type: 'asset/resource',
        });
        return webpackConfig;
      },
    },
    devServer: {
      port: process.env.PORT || 3002,
      open: false, // 禁用自动打开浏览器
      headers: { 'Cache-Control': 'max-age=31536000' }, // Set a long cache lifetime for static assets
      setupMiddlewares: (middlewares, devServer) => {
        devServer.app.get('*.ogg', (req, res, next) => {

          res.set('Content-Type', 'audio/ogg');
          next();
        });
        return middlewares;
      },
    },
    eslint: null,
  };
};