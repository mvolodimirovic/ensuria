const isWpScripts = /\bwp-scripts\b/.test(process.env.npm_lifecycle_script || "");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const glob = require("glob");
const fs = require("fs");

const themeEntries = {};
glob.sync("./src/js/**/*.js").forEach((file) => {
  const normalizedPath = file.replace(/\\/g, "/");
  if (normalizedPath.includes("/blocks/")) return;

  let relativePath = path.relative("./src/js", file);
  relativePath = relativePath.replace(/\\/g, "/");
  const name = relativePath.replace(/\.js$/, "");
  if (name !== "swiper") {
    themeEntries[name] = path.resolve(__dirname, file);
  }
});

const themeConfig = {
  entry: themeEntries,
  output: {
    path: path.resolve(__dirname, "assets/js"),
    filename: "[name].min.js",
    chunkFilename: (pathData) => {
      const name = pathData.chunk.name;
      if (name && name.startsWith("blocks/")) {
        return `${name}.min.js`;
      }
      return `[name].min.js`;
    },
    clean: false,
    chunkFormat: "module",
  },
  mode: "production",
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!swiper.min.js", "!swiper.min.js.map"],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false })],
    runtimeChunk: false,
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        swiper: {
          test: /[\\/]node_modules[\\/]swiper[\\/]/,
          name: "swiper",
          chunks: "all",
          enforce: true,
          priority: 20,
        },
      },
    },
  },
  experiments: {
    outputModule: true,
  },
  stats: "errors-only",
};

function buildPluginConfig(pluginSlug) {
  const pluginRoot = path.resolve(__dirname, "../../plugins", pluginSlug);
  const pluginJsDir = path.resolve(pluginRoot, "assets/js");

  if (!fs.existsSync(pluginJsDir)) return null;

  const pattern = pluginJsDir.replace(/\\/g, "/") + "/**/*.js";
  const pluginFiles = glob
    .sync(pattern, { nodir: true })
    .filter((f) => !f.endsWith(".min.js"));

  if (!pluginFiles.length) return null;

  const entries = {};
  pluginFiles.forEach((file) => {
    const rel = path.relative(pluginJsDir, file).replace(/\\/g, "/");
    const name = rel.replace(/\.js$/, "");
    entries[name] = path.resolve(file);
  });

  return {
    entry: entries,
    output: {
      path: pluginJsDir,
      filename: "[name].min.js",
      clean: false,
    },
    mode: "production",
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({ extractComments: false })],
      runtimeChunk: false,
      splitChunks: false,
    },
    stats: "errors-only",
  };
}

const pluginSlugs = ["ensuria-contact-form"];
const pluginConfigs = pluginSlugs.map(buildPluginConfig).filter(Boolean);

const baseConfig = isWpScripts
  ? require("@wordpress/scripts/config/webpack.config")
  : themeConfig;

const baseConfigs = Array.isArray(baseConfig) ? baseConfig : [baseConfig];

module.exports = [...baseConfigs, ...pluginConfigs];
