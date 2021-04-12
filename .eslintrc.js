const path = require("path");
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  extends: ["@nuxtjs/eslint-config-typescript", "eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  rules: {
    // enable additional rules
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-console": "off",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    project: path.resolve(__dirname, "./tsconfig.json"),
    tsconfigRootDir: __dirname,
    sourceType: "module",
    ecmaFeatures: {
      jsx: false,
    },
    warnOnUnsupportedTypeScriptVersion: true,
    extraFileExtensions: ".vue",
  },
};
