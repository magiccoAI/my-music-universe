const webpack = require("webpack");
const path = require("path");
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
      
      configure: (webpackConfig, { env, paths }) => {
        webpackConfig.module.rules.push({
              test: /\.ogg$/,
              type: 'asset/resource',
            });
            webpackConfig.output.publicPath = process.env.PUBLIC_URL + '/';
            return webpackConfig;
      },
    },
    devServer: {
      port: process.env.PORT || 3002,
      open: false, // 禁用自动打开浏览器
      headers: { 'Cache-Control': 'max-age=31536000' }, // Set a long cache lifetime for static assets
      static: {
        directory: path.resolve(__dirname, 'public'),
      },
      historyApiFallback: {
        index: '/my-music-universe/index.html',
        rewrites: [
          { from: /\/my-music-universe\/.* /, to: '/my-music-universe/index.html' },
        ],
      },
      setupMiddlewares: (middlewares, devServer) => {
        devServer.app.get('*.ogg', (req, res, next) => {

          res.set('Content-Type', 'audio/ogg');
          next();
        });

        devServer.app.get('*.json', (req, res, next) => {
          res.set('Content-Type', 'application/json');
          next();
        });
        return middlewares;
      },
    },
    eslint: null,
  };
};