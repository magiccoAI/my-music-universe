const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
// const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = function ({ env }) {
  const isProductionBuild = process.env.NODE_ENV === "production";
  const analyzerMode = process.env.REACT_APP_INTERACTIVE_ANALYZE
    ? "server"
    : "json";
  const plugins = [];

  if (isProductionBuild) {
    plugins.push(new BundleAnalyzerPlugin({ analyzerMode }));
  }
  // plugins.push(new ESLintPlugin({ extensions: ['js', 'jsx', 'ts', 'tsx'], eslintPath: require.resolve('eslint') }));

  return {
    webpack: {
      plugins,
    },
    devServer: {
      port: process.env.PORT || 3002,
      open: false, // 禁用自动打开浏览器
    },
    eslint: null,
  };
};