const webpack = require("webpack");
const path = require("path");

module.exports = function ({ env }) {
  const isProductionBuild = env === "production";
  const publicUrl = process.env.PUBLIC_URL || '';
  const plugins = [];

  return {
    webpack: {
      plugins: plugins,
      configure: (webpackConfig, { env: webpackEnv, paths }) => {
        // Handle .ogg files
        webpackConfig.module.rules.push({
          test: /\.ogg$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/media/[name].[contenthash][ext]'
          }
        });

        // Set public path
        webpackConfig.output.publicPath = publicUrl.endsWith('/') 
          ? publicUrl 
          : publicUrl + '/';

        return webpackConfig;
      },
    },

    eslint: null,
  };
};
