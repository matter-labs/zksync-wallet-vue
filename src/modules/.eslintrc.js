module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: ["@nuxtjs/eslint-config-typescript", "plugin:prettier/recommended", "plugin:nuxt/recommended"],
  plugins: [],
  // add your custom rules here
  rules: {
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    camelcase: "off",
    indent: "off",
    semi: ["error", "always"],
  },
};
