const cypressNuxt = require("cypress-nuxt");
module.exports = async (on, config) => {
  // make sure to include "async"!
  on("file:preprocessor", await filePreprocessor()); // make sure to include "await"!

  // other plugins...
  return config;
};

function filePreprocessor() {
  require("ts-node").register({
    compilerOptions: {
      target: "es5",
      module: "commonjs", // node expects commonjs format
    },
  });
  // return the promise to return the webpack config
  return cypressNuxt.plugin({});
}

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
};
